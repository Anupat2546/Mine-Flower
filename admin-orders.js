/* ============================================================
   MINE FLOWERS — ORDERS DASHBOARD (เจ้าของร้านดูออเดอร์ลูกค้าได้ทันที)
   อ่านออเดอร์แบบเรียลไทม์จาก Firestore (เขียนเข้ามาโดย Cloud Function
   "submitOrder" ในไฟล์ functions/index.js ทุกครั้งที่ลูกค้ากดสั่งซื้อสำเร็จ
   จากอุปกรณ์ไหนก็ตาม — PC, มือถือ iOS/Android, Mac)

   ⚠️ ต้องตั้งค่า 2 อย่างนี้ก่อนใช้งานจริง:
   1) ใส่อีเมล Google ของเจ้าของร้านที่อนุญาตให้เข้าดูออเดอร์ได้ที่ ADMIN_EMAILS
      ด้านล่างนี้
   2) ไปตั้งค่า Firestore Security Rules ใน Firebase Console ให้จำกัดสิทธิ์
      อ่านเฉพาะอีเมลเดียวกันนี้เท่านั้น (ดูตัวอย่าง rules และวิธีตั้งค่าใน
      README.md หัวข้อ "หน้าออเดอร์ลูกค้าแบบเรียลไทม์")
   ============================================================ */

// ใช้ค่าเดียวกับใน auth.js — คัดลอกมาซ้ำเพราะหน้า admin.html แยกจากหน้าร้าน
// (ค่า apiKey ของ Firebase web app ไม่ใช่ความลับ เปิดเผยในโค้ดฝั่งเว็บได้ตามปกติ
// ความปลอดภัยจริงๆ ถูกบังคับด้วย Firestore Security Rules แทน)
const ORDERS_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBKIEgLm9NropDTxYA-noeuqDEZtynZ_8E",
  authDomain: "mine-flower.firebaseapp.com",
  projectId: "mine-flower",
  storageBucket: "mine-flower.firebasestorage.app",
  messagingSenderId: "210230198491",
  appId: "1:210230198491:web:2ebd8c992af4d1eef30cfe",
};

// 👉 ใส่อีเมล Google ของเจ้าของร้าน (คนที่อนุญาตให้ดูออเดอร์ได้) ตรงนี้
// ต้องตั้งค่า Firestore Rules ให้ตรงกับอีเมลนี้ด้วย ไม่งั้นจะเข้าสู่ระบบได้
// แต่โหลดออเดอร์ไม่ขึ้น (ถูก Firestore Rules บล็อกไว้)
const ADMIN_EMAILS = ["zaszasza321@gmail.com"];

firebase.initializeApp(ORDERS_FIREBASE_CONFIG);
const ordersAuth = firebase.auth();
const ordersDb = firebase.firestore();

const ordersGate = document.getElementById("ordersGate");
const ordersPanel = document.getElementById("ordersPanel");
const ordersList = document.getElementById("ordersList");
const ordersWho = document.getElementById("ordersWho");
const ordersLoginBtn = document.getElementById("ordersLoginBtn");
const ordersLogoutBtn = document.getElementById("ordersLogoutBtn");

let unsubscribeOrders = null;

ordersLoginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  ordersAuth.signInWithPopup(provider).catch((err) => {
    console.error(err);
    showToast("เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง");
  });
});

ordersLogoutBtn.addEventListener("click", () => ordersAuth.signOut());

ordersAuth.onAuthStateChanged((user) => {
  if (unsubscribeOrders) {
    unsubscribeOrders();
    unsubscribeOrders = null;
  }

  const allowed = user && ADMIN_EMAILS.includes(user.email);

  if (allowed) {
    ordersGate.style.display = "none";
    ordersPanel.style.display = "";
    ordersWho.textContent = `เข้าสู่ระบบเป็น ${user.email}`;
    ordersLogoutBtn.style.display = "";
    subscribeOrders();
  } else {
    if (user) {
      // ล็อกอินสำเร็จแต่อีเมลไม่อยู่ในรายชื่อที่อนุญาต
      showToast("บัญชีนี้ไม่มีสิทธิ์ดูออเดอร์ (ไม่อยู่ใน ADMIN_EMAILS)");
      ordersAuth.signOut();
    }
    ordersGate.style.display = "";
    ordersPanel.style.display = "none";
    ordersLogoutBtn.style.display = "none";
  }
});

function escapeOrderText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

let lastOrderDocs = [];

function renderOrders() {
  if (!lastOrderDocs.length) {
    ordersList.innerHTML = '<p class="order-history__empty">ยังไม่มีออเดอร์เข้ามา</p>';
    return;
  }
  ordersList.innerHTML = lastOrderDocs
    .map((doc) => {
      const o = doc.data();
      const time = o.createdAt && o.createdAt.toDate ? o.createdAt.toDate().toLocaleString("th-TH") : "กำลังบันทึก...";
      const st = orderStatusInfo(o.status || DEFAULT_ORDER_STATUS);
      const slips = (o.slipUrls || [])
        .map(
          (url) =>
            `<a href="${url}" target="_blank" rel="noopener"><img src="${url}" class="order-card__slip" alt="สลิปโอนเงิน" loading="lazy"></a>`
        )
        .join("");
      const options = ORDER_STATUSES.map(
        (s) => `<option value="${s.key}" ${s.key === st.key ? "selected" : ""}>${s.icon} ${s.label}</option>`
      ).join("");
      return `
      <article class="order-card" data-order-id="${doc.id}">
        <div class="order-card__head">
          <span class="order-card__time">🕐 ${time}</span>
          <span class="status-badge status--${st.key}">${st.icon} ${st.label}</span>
        </div>
        <pre class="order-card__message">${escapeOrderText(o.message)}</pre>
        ${slips ? `<div class="order-card__slips">${slips}</div>` : ""}
        <div class="order-card__controls">
          <select class="order-status__select" aria-label="สถานะออเดอร์">${options}</select>
          <input type="text" class="order-status__reason" placeholder="ระบุเหตุผลที่ยกเลิก (จำเป็น)" maxlength="200"
                 value="${escapeOrderText(o.statusReason || "")}" style="${st.key === "cancelled" ? "" : "display:none;"}">
          <button type="button" class="btn btn--primary btn--sm order-status__save">บันทึกสถานะ</button>
        </div>
      </article>`;
    })
    .join("");
}

// แสดงช่องกรอกเหตุผลเฉพาะตอนเลือก "ยกเลิกออเดอร์"
ordersList.addEventListener("change", (e) => {
  if (!e.target.classList.contains("order-status__select")) return;
  const card = e.target.closest(".order-card");
  const reason = card.querySelector(".order-status__reason");
  reason.style.display = e.target.value === "cancelled" ? "" : "none";
  if (e.target.value === "cancelled") reason.focus();
});

// บันทึกสถานะลง Firestore → ลูกค้าเห็นได้ทุกอุปกรณ์ผ่านหน้าประวัติออเดอร์
ordersList.addEventListener("click", async (e) => {
  const btn = e.target.closest(".order-status__save");
  if (!btn) return;
  const card = btn.closest(".order-card");
  const status = card.querySelector(".order-status__select").value;
  const reason = card.querySelector(".order-status__reason").value.trim();
  if (status === "cancelled" && !reason) {
    showToast("กรุณาระบุเหตุผลที่ยกเลิกออเดอร์");
    card.querySelector(".order-status__reason").focus();
    return;
  }
  btn.disabled = true;
  try {
    await ordersDb.collection("orders").doc(card.dataset.orderId).update({
      status,
      statusReason: status === "cancelled" ? reason : "",
      statusUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    showToast("อัปเดตสถานะแล้ว ✅");
  } catch (err) {
    console.error(err);
    showToast("บันทึกสถานะไม่สำเร็จ — เช็ค Firestore Rules (ต้องอนุญาต update) ดู README.md");
  } finally {
    btn.disabled = false;
    btn.blur();
  }
});

// ถ้าแอดมินกำลังเลือก/พิมพ์ในการ์ด จะไม่วาดหน้าใหม่ทับ (ไม่งั้นข้อความที่พิมพ์หาย)
// แล้วค่อยวาดใหม่เมื่อเลิกโฟกัส
ordersList.addEventListener("focusout", () => {
  setTimeout(() => { if (!ordersList.contains(document.activeElement)) renderOrders(); }, 200);
});

function subscribeOrders() {
  ordersList.innerHTML = '<p class="order-history__empty">กำลังโหลดออเดอร์...</p>';
  unsubscribeOrders = ordersDb
    .collection("orders")
    .orderBy("createdAt", "desc")
    .limit(50)
    .onSnapshot(
      (snapshot) => {
        lastOrderDocs = snapshot.docs;
        if (!ordersList.contains(document.activeElement)) renderOrders();
      },
      (err) => {
        console.error(err);
        ordersList.innerHTML =
          '<p class="order-history__empty">โหลดออเดอร์ไม่สำเร็จ — เช็คว่าตั้งค่า Firestore Security Rules ถูกต้องหรือยัง (ดู README.md)</p>';
      }
    );
}
