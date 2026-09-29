/* ============================================================
   Cloud Function: lineLogin
   หน้าที่: รับ "code" ที่ได้จาก LINE Login แล้วแลกเป็น
   Firebase custom token ส่งกลับไปให้หน้าเว็บ (auth.js เรียกใช้ตัวนี้)

   ทำไมต้องมีไฟล์นี้แยกเป็น Cloud Function (ฝั่งเซิร์ฟเวอร์)?
   เพราะขั้นตอนนี้ต้องใช้ LINE_CHANNEL_SECRET ซึ่งเป็นความลับ
   ห้ามเอาไปใส่ในโค้ดหน้าเว็บ (auth.js/script.js) เด็ดขาด เพราะใครก็เปิด
   ดูโค้ดหน้าเว็บได้ทุกคน จึงต้องซ่อนไว้ในฝั่งเซิร์ฟเวอร์แบบนี้เท่านั้น

   วิธีตั้งค่าและ deploy (รันจากเครื่องที่ลง Node.js + Firebase CLI แล้ว):
   1) firebase login
   2) firebase init functions   (เลือกโปรเจกต์ที่สร้างไว้ใน Firebase Console)
   3) แทนที่ functions/index.js ด้วยไฟล์นี้ และ functions/package.json ด้วยไฟล์ที่แนบมา
   4) ตั้งค่าความลับ (Node 18+/Functions v2 ใช้ .env แทน functions:config ที่เลิกใช้แล้ว):
        - สร้างไฟล์ functions/.env ใส่:
            LINE_CHANNEL_ID=รหัส Channel ID จาก LINE Developers
            LINE_CHANNEL_SECRET=รหัส Channel Secret จาก LINE Developers
   5) firebase deploy --only functions
   6) จะได้ URL ของฟังก์ชันมา เอาไปใส่ใน auth.js ช่อง LINE_LOGIN.TOKEN_EXCHANGE_URL
   ============================================================ */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();

// กติกาค่าส่ง — ต้องตรงกับ CONFIG.DELIVERY_* ใน inventory-config.js ฝั่งหน้าเว็บ
const DELIVERY = { ORIGIN: { lat: 13.9545, lng: 100.6285 }, MAX_KM: 20, FREE_KM: 10, FEE: 50 };

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

const LINE_CHANNEL_ID = defineSecret("LINE_CHANNEL_ID");
const LINE_CHANNEL_SECRET = defineSecret("LINE_CHANNEL_SECRET");

// 👉 จาก SlipOK Dashboard > สาขา (Branch) ที่สร้างไว้ > API Key
const SLIPOK_API_KEY = defineSecret("SLIPOK_API_KEY");
const SLIPOK_BRANCH_ID = defineSecret("SLIPOK_BRANCH_ID");

// submitOrder ไม่ส่งเข้า LINE แล้ว — บันทึกออเดอร์ลง Firestore อย่างเดียว

exports.submitOrder = onRequest(
  { cors: true, invoker: "public" },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

    try {
      const { message, slips = [], summary: rawSummary, idToken } = req.body || {};
      if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "missing message" });
      }
      if (!Array.isArray(slips) || slips.length > 5) {
        return res.status(400).json({ error: "invalid slips" });
      }

      // ตรวจกติการะยะทาง/ค่าส่งซ้ำฝั่งเซิร์ฟเวอร์ (กันกรณีมีการแก้ค่าในเบราว์เซอร์)
      // ระยะเส้นตรงต้องไม่เกิน MAX_KM และระยะถนนที่แจ้งมาต้องไม่น้อยกว่าเส้นตรง
      const ds = rawSummary && typeof rawSummary === "object" ? rawSummary : {};
      const numOrNaN = (v) => (typeof v === "number" && Number.isFinite(v) ? v : NaN);
      const dKm = numOrNaN(ds.deliveryKm), dLat = numOrNaN(ds.deliveryLat), dLng = numOrNaN(ds.deliveryLng);
      if (![dKm, dLat, dLng].every(Number.isFinite) || dKm < 0 || dKm > DELIVERY.MAX_KM) {
        return res.status(400).json({ error: "out of delivery range" });
      }
      const straightKm = haversineKm(DELIVERY.ORIGIN.lat, DELIVERY.ORIGIN.lng, dLat, dLng);
      if (straightKm > DELIVERY.MAX_KM || dKm + 0.2 < straightKm) {
        return res.status(400).json({ error: "out of delivery range" });
      }
      const expectedFee = dKm <= DELIVERY.FREE_KM ? 0 : DELIVERY.FEE;
      if (numOrNaN(ds.deliveryFee) !== expectedFee) {
        return res.status(400).json({ error: "delivery fee mismatch" });
      }

      const slipUrls = [];
      const bucket = admin.storage().bucket();
      for (let index = 0; index < slips.length; index += 1) {
        const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(slips[index]);
        if (!match) continue;
        const mimeType = match[1];
        const buffer = Buffer.from(match[2], "base64");
        if (buffer.length > 8 * 1024 * 1024) continue;
        const extension = mimeType.split("/")[1].replace(/[^a-z0-9]/gi, "") || "jpeg";
        const file = bucket.file(`order-slips/${Date.now()}-${index}.${extension}`);
        await file.save(buffer, { metadata: { contentType: mimeType } });
        // อายุลิงก์ 7 วัน (สูงสุดที่ signed URL รองรับ) ให้เจ้าของร้านเปิดดู
        // ย้อนหลังในหน้า admin ได้สักพัก (ไม่ทำให้ไฟล์เปิดสาธารณะตลอดไป เพราะ
        // เป็นข้อมูลการเงินของลูกค้า)
        const [imageUrl] = await file.getSignedUrl({
          action: "read",
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
        slipUrls.push(imageUrl);
      }

      // บันทึกออเดอร์ลง Firestore — เป็นที่เก็บเดียวของออเดอร์ (ลูกค้าดูประวัติในเว็บ
      // และเจ้าของร้านดูในหน้า admin.html) ถ้าบันทึกไม่สำเร็จต้องแจ้งว่าล้มเหลว
      // เพื่อไม่ให้ลูกค้าคิดว่าสั่งสำเร็จทั้งที่ร้านไม่ได้รับออเดอร์
      let orderId = null;
      try {
        // ถ้าลูกค้าล็อกอินอยู่ ยืนยัน ID token แล้วผูกออเดอร์กับบัญชี (ดูสถานะข้ามอุปกรณ์ได้)
        let ownerUid = null;
        if (typeof idToken === "string" && idToken) {
          try { ownerUid = (await admin.auth().verifyIdToken(idToken)).uid; } catch (e) {}
        }
        const s = rawSummary && typeof rawSummary === "object" ? rawSummary : {};
        const clip = (v, n) => String(v ?? "").slice(0, n);
        const summary = {
          items: Array.isArray(s.items) ? s.items.slice(0, 30).map((x) => clip(x, 300)) : [],
          total: Number(s.total) || 0,
          subtotal: Number(s.subtotal) || 0,
          deliveryKm: dKm,
          deliveryFee: expectedFee,
          recipient: clip(s.recipient, 120),
          deliveryDate: clip(s.deliveryDate, 20),
          deliveryTime: clip(s.deliveryTime, 20),
        };
        const ref = await admin.firestore().collection("orders").add({
          message,
          slipUrls,
          summary,
          ownerUid,
          status: "pending",       // pending | ordered | delivering | delivered | cancelled
          statusReason: "",        // เหตุผล (ใช้ตอนยกเลิกออเดอร์)
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        orderId = ref.id;
      } catch (dbErr) {
        console.error("save order to Firestore failed:", dbErr);
        return res.status(500).json({ error: "save order failed" });
      }

      return res.json({ ok: true, orderId });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "internal error" });
    }
  }
);

exports.lineLogin = onRequest(
  { secrets: [LINE_CHANNEL_ID, LINE_CHANNEL_SECRET], cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "method not allowed" });
    }

    try {
      const { code, redirectUri } = req.body || {};
      if (!code || !redirectUri) {
        return res.status(400).json({ error: "missing code or redirectUri" });
      }

      // 1) แลก authorization code เป็น access token กับ LINE
      const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
          client_id: LINE_CHANNEL_ID.value(),
          client_secret: LINE_CHANNEL_SECRET.value(),
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        console.error("LINE token exchange failed:", tokenData);
        return res.status(400).json({ error: "line token exchange failed" });
      }

      // 2) ดึงข้อมูลโปรไฟล์ลูกค้าจาก LINE
      const profileRes = await fetch("https://api.line.me/v2/profile", {
        headers: { Authorization: "Bearer " + tokenData.access_token },
      });
      const profile = await profileRes.json();
      if (!profile.userId) {
        console.error("LINE profile fetch failed:", profile);
        return res.status(400).json({ error: "line profile fetch failed" });
      }

      // 3) สร้าง Firebase custom token ผูกกับ LINE userId ของลูกค้าคนนี้
      //    (คนเดิมเข้าอีกครั้งจะได้ uid เดิมเสมอ เพราะ uid มาจาก LINE userId)
      const uid = "line:" + profile.userId;
      const customToken = await admin.auth().createCustomToken(uid, {
        provider: "line",
        name: profile.displayName || "",
        picture: profile.pictureUrl || "",
      });

      res.json({ token: customToken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal error" });
    }
  }
);

/* ============================================================
   Cloud Function: verifySlip
   หน้าที่: รับรูปสลิปโอนเงิน (base64) + ยอดเงินที่คาดว่าจะได้รับ
   จากหน้าเว็บ (script.js เรียกใช้ตัวนี้ตอนลูกค้าแนบรูปสลิป) แล้วส่งต่อไป
   ตรวจสอบกับ SlipOK API เพื่อเช็คว่า:
     - เป็นสลิปโอนเงินจริง อ่าน QR ได้
     - ยอดเงินตรงกับยอดที่ลูกค้าต้องจ่ายไหม
     - โอนเข้าบัญชีหลักของร้าน (ที่ผูกไว้กับสาขา SlipOK) จริงไหม
     - เป็นสลิปซ้ำที่เคยส่งเข้ามาก่อนหน้านี้ไหม (กันลูกค้าเอาสลิปเก่ามาใช้ซ้ำ)

   ทำไมต้องมี Cloud Function แยกต่างหาก (ฝั่งเซิร์ฟเวอร์)?
   เพราะ SlipOK API Key เป็นความลับ ห้ามฝังไว้ในโค้ดหน้าเว็บ (script.js)
   เด็ดขาด เพราะใครก็เปิดดูโค้ดหน้าเว็บได้ทุกคน จึงต้องซ่อนไว้ในฝั่ง
   เซิร์ฟเวอร์แบบนี้เท่านั้น (หลักการเดียวกับ lineLogin ด้านบน)

   วิธีตั้งค่าและ deploy เพิ่ม (ต่อจากขั้นตอน lineLogin ด้านบน):
   1) สมัครและสร้าง "สาขา" ใน SlipOK Dashboard (https://slipok.com)
      ผูกบัญชีธนาคารร้านไว้กับสาขานั้น จะได้ Branch ID + API Key
   2) ตั้งค่าความลับเพิ่มในไฟล์ functions/.env:
        SLIPOK_API_KEY=รหัส API Key จาก SlipOK
        SLIPOK_BRANCH_ID=รหัสสาขา (Branch ID) จาก SlipOK
   3) firebase deploy --only functions
   4) จะได้ URL ของฟังก์ชันมา เอาไปใส่ใน inventory-config.js ช่อง
      CONFIG.SLIPOK_VERIFY_URL
   ============================================================ */
exports.verifySlip = onRequest(
  { secrets: [SLIPOK_API_KEY, SLIPOK_BRANCH_ID], cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "method not allowed" });
    }

    try {
      const { imageBase64, amount } = req.body || {};
      if (!imageBase64) {
        return res.status(400).json({ error: "missing imageBase64" });
      }

      // imageBase64 เป็น data URL แบบ "data:image/jpeg;base64,xxxxx"
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(imageBase64);
      const mimeType = match ? match[1] : "image/jpeg";
      const rawBase64 = match ? match[2] : imageBase64;
      const buffer = Buffer.from(rawBase64, "base64");

      // จำกัดขนาดไฟล์คร่าวๆ ป้องกันคำขอที่ใหญ่ผิดปกติ (SlipOK รับไม่เกิน ~5MB)
      if (buffer.length > 8 * 1024 * 1024) {
        return res.status(400).json({ error: "image too large" });
      }

      const form = new FormData();
      form.append("files", new Blob([buffer], { type: mimeType }), "slip.jpg");
      // log:true ให้ SlipOK เช็คบัญชีผู้รับกับบัญชีหลักของสาขา + ตรวจจับสลิปซ้ำ
      // (ถ้าไม่ใส่หรือใส่ false จะตรวจแค่ว่าเป็นสลิปจริงกับยอดเงินเท่านั้น)
      form.append("log", "true");
      if (amount !== undefined && amount !== null && amount !== "") {
        form.append("amount", String(amount));
      }

      const branchId = SLIPOK_BRANCH_ID.value();
      const apiKey = SLIPOK_API_KEY.value();

      const slipRes = await fetch(`https://api.slipok.com/api/line/apikey/${branchId}`, {
        method: "POST",
        headers: { "x-authorization": apiKey },
        body: form,
      });

      const result = await slipRes.json();
      // ส่งผลลัพธ์ดิบจาก SlipOK กลับไปให้หน้าเว็บตีความต่อ (ดู
      // SLIPOK_ERROR_MESSAGES ในไฟล์ script.js สำหรับความหมายของแต่ละ code)
      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "internal error" });
    }
  }
);

/* ============================================================
   Cloud Function: orderStatus
   หน้าที่: ให้หน้าประวัติออเดอร์ของลูกค้า (ทุกอุปกรณ์) ดึง "สถานะล่าสุด"
   ที่เจ้าของร้านตั้งไว้ในหน้า admin
     - ส่ง idToken มา (ลูกค้าล็อกอิน) → ได้ออเดอร์ทั้งหมดของบัญชีนั้น
     - ส่ง ids มา (ไอดีออเดอร์ที่เก็บไว้ในเครื่อง) → ได้สถานะของออเดอร์เหล่านั้น
   คืนเฉพาะสถานะ + สรุปสั้นๆ ไม่คืนที่อยู่/เบอร์โทร/สลิป

   deploy: firebase deploy --only functions แล้วเอา URL ของ orderStatus
   ไปใส่ใน inventory-config.js ช่อง CONFIG.ORDER_STATUS_URL
   ============================================================ */
exports.orderStatus = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  try {
    const { ids = [], idToken } = req.body || {};
    const db = admin.firestore();
    const out = new Map();
    const pick = (doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        status: d.status || "pending",
        statusReason: d.statusReason || "",
        summary: d.summary || null,
        createdAtMs: d.createdAt && d.createdAt.toMillis ? d.createdAt.toMillis() : null,
      };
    };

    if (typeof idToken === "string" && idToken) {
      try {
        const { uid } = await admin.auth().verifyIdToken(idToken);
        const snap = await db.collection("orders").where("ownerUid", "==", uid).limit(30).get();
        snap.forEach((doc) => out.set(doc.id, pick(doc)));
      } catch (e) {
        console.warn("verifyIdToken failed:", e.message);
      }
    }

    // ID ของ Firestore สุ่มยาว 20 ตัว เดาไม่ได้ จึงใช้เป็นตัวอ้างอิงของลูกค้าที่ไม่ล็อกอินได้
    const cleanIds = Array.isArray(ids)
      ? ids.filter((i) => typeof i === "string" && /^[A-Za-z0-9]{20}$/.test(i)).slice(0, 30)
      : [];
    const docs = await Promise.all(cleanIds.map((i) => db.collection("orders").doc(i).get()));
    docs.forEach((doc) => { if (doc.exists) out.set(doc.id, pick(doc)); });

    return res.json({ orders: [...out.values()] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
});
