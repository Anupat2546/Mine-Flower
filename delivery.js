/* ============================================================
   MINE FLOWERS — ค่าจัดส่งตามระยะทาง (ต้นทาง: ตลาดไท)
   กติกา (ตั้งค่าได้ใน inventory-config.js):
     • ระยะทางถนนไม่เกิน DELIVERY_MAX_KM (20 กม.) ถึงจะสั่งได้
     • ≤ DELIVERY_FREE_KM (10 กม.)  → ส่งฟรี
     • > 10 ถึง 20 กม.              → ค่าส่ง DELIVERY_FEE (50 บาท) รวมเข้ายอดชำระ

   วิธีคำนวณ (ฟรี ไม่ต้องใช้ API key):
     ที่อยู่ → พิกัด : OpenStreetMap Nominatim (หรือใช้ GPS ของลูกค้า)
     พิกัด  → ระยะทางถนน : OSRM (ถ้าเรียกไม่สำเร็จ ใช้ระยะเส้นตรง × ROAD_FACTOR แทน)
   ============================================================ */

const deliveryState = {
  status: "idle", // idle | loading | ok | far | error
  km: null,
  fee: 0,
  lat: null,
  lng: null,
  label: "",
  source: "", // "address" | "gps"
  query: "",
  estimated: false, // true = OSRM ใช้ไม่ได้ ใช้ค่าประมาณจากระยะเส้นตรง
  approx: false, // true = หาพิกัดได้แค่ระดับตำบล/อำเภอ
  message: "",
};
let deliveryRunId = 0;

/* ---------- กติกาค่าส่ง ---------- */
function deliveryFeeForKm(km) {
  return km <= CONFIG.DELIVERY_FREE_KM ? 0 : CONFIG.DELIVERY_FEE;
}
// ค่าส่งที่นับรวมในยอดชำระตอนนี้ (0 ถ้ายังคำนวณไม่สำเร็จ)
function deliveryFeeNow() {
  return deliveryState.status === "ok" ? deliveryState.fee : 0;
}
// คืนข้อความเหตุผลถ้ายังสั่งซื้อไม่ได้ / คืน "" ถ้าผ่าน
function getDeliveryBlockReason() {
  if (deliveryState.status === "loading") return "กำลังคำนวณระยะทาง รอสักครู่นะคะ";
  if (deliveryState.status === "far") {
    return `ที่อยู่จัดส่งไกลเกิน ${CONFIG.DELIVERY_MAX_KM} กม. จาก${CONFIG.DELIVERY_ORIGIN.name} ขออภัยยังส่งไม่ได้ค่ะ`;
  }
  if (deliveryState.status !== "ok") return "กรุณากด “คำนวณค่าจัดส่ง” ก่อนยืนยันสั่งซื้อ";
  return "";
}

/* ---------- คำนวณระยะทาง ---------- */
function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

async function fetchDrivingKm(lat, lng) {
  const o = CONFIG.DELIVERY_ORIGIN;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${o.lng},${o.lat};${lng},${lat}?overview=false`;
    const res = await fetch(url, { signal: ctrl.signal });
    const data = await res.json();
    if (data.code === "Ok" && data.routes && data.routes[0]) {
      return { km: data.routes[0].distance / 1000, estimated: false };
    }
  } catch (e) {
    /* ตกไปใช้ค่าประมาณด้านล่าง */
  } finally {
    clearTimeout(timer);
  }
  return { km: haversineKm(o.lat, o.lng, lat, lng) * CONFIG.ROAD_FACTOR, estimated: true };
}

/* ---------- ที่อยู่ → พิกัด ---------- */
const deliverySleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function nominatimSearch(q) {
  const params = new URLSearchParams({
    q,
    format: "jsonv2",
    limit: "1",
    countrycodes: "th",
    "accept-language": "th",
  });
  const res = await fetch("https://nominatim.openstreetmap.org/search?" + params.toString());
  if (!res.ok) throw new Error("geocode failed");
  const arr = await res.json();
  return arr.length ? { lat: Number(arr[0].lat), lng: Number(arr[0].lon), label: arr[0].display_name } : null;
}

async function geocodeAddress(text) {
  const full = await nominatimSearch(text);
  if (full) return { ...full, approx: false };
  // ที่อยู่ละเอียดเกินไปจนหาไม่เจอ → ลองใช้ 3 คำท้าย (ตำบล/อำเภอ/จังหวัด) แต่ถือเป็นค่าประมาณ
  const tokens = text.split(/[\s,]+/).filter(Boolean);
  if (tokens.length > 3) {
    await deliverySleep(1100); // Nominatim จำกัด 1 request/วินาที
    const rough = await nominatimSearch(tokens.slice(-3).join(" "));
    if (rough) return { ...rough, approx: true };
  }
  return null;
}

/* ---------- แสดงผลใน UI ---------- */
function renderDeliveryInfo() {
  const el = document.getElementById("deliveryInfo");
  if (!el) return;
  const s = deliveryState;
  el.className = "delivery-box__info";
  if (s.status === "loading") {
    el.textContent = "⏳ กำลังคำนวณระยะทาง...";
  } else if (s.status === "ok") {
    el.classList.add("delivery-box__info--ok");
    const feeText = s.fee === 0 ? "ส่งฟรี 🎉" : `ค่าจัดส่ง ${s.fee} บาท`;
    let text = `📍 ระยะทางประมาณ ${s.km} กม. จาก${CONFIG.DELIVERY_ORIGIN.name} — ${feeText}`;
    if (s.label) text += `\nตำแหน่งที่ระบบหาได้: ${s.label}`;
    if (s.approx) text += "\n⚠️ หาตำแหน่งได้แค่ระดับตำบล/อำเภอ ระยะทางอาจคลาดเคลื่อน แนะนำให้กด “ใช้ตำแหน่งปัจจุบัน” ที่จุดส่งเพื่อความแม่นยำ";
    if (s.estimated) text += "\n⚠️ ระบบคำนวณเส้นทางไม่พร้อมใช้งาน จึงใช้ค่าประมาณ ร้านจะยืนยันอีกครั้ง";
    el.textContent = text;
  } else if (s.status === "far") {
    el.classList.add("delivery-box__info--bad");
    el.textContent = `❌ ระยะทางประมาณ ${s.km} กม. ไกลเกิน ${CONFIG.DELIVERY_MAX_KM} กม. จาก${CONFIG.DELIVERY_ORIGIN.name} ขออภัยยังส่งไม่ได้ค่ะ`;
  } else if (s.status === "error") {
    el.classList.add("delivery-box__info--bad");
    el.textContent = s.message || "คำนวณระยะทางไม่สำเร็จ ลองใหม่อีกครั้ง";
  } else {
    el.textContent = "กรอกที่อยู่จัดส่ง แล้วกด “คำนวณค่าจัดส่ง” (หรือกด “ใช้ตำแหน่งปัจจุบัน” ถ้าอยู่ที่จุดส่ง)";
  }
  // ตะกร้า/ยอดรวมต้องอัปเดตตามค่าส่งใหม่
  if (typeof renderCart === "function") renderCart();
}

function resetDelivery() {
  deliveryRunId += 1; // ยกเลิกงานที่ค้างอยู่
  Object.assign(deliveryState, {
    status: "idle", km: null, fee: 0, lat: null, lng: null,
    label: "", source: "", query: "", estimated: false, approx: false, message: "",
  });
  renderDeliveryInfo();
}

async function runDelivery(getPoint, source, query) {
  const runId = (deliveryRunId += 1);
  const prevFee = deliveryFeeNow();
  Object.assign(deliveryState, { status: "loading", km: null, fee: 0 });
  renderDeliveryInfo();

  try {
    const point = await getPoint();
    if (runId !== deliveryRunId) return;
    if (!point) {
      Object.assign(deliveryState, {
        status: "error",
        source: "",
        message: "หาตำแหน่งจากที่อยู่นี้ไม่เจอ ลองเพิ่มตำบล อำเภอ จังหวัด หรือกด “ใช้ตำแหน่งปัจจุบัน” แทน",
      });
    } else {
      const { km, estimated } = await fetchDrivingKm(point.lat, point.lng);
      if (runId !== deliveryRunId) return;
      const kmRounded = Math.round(km * 10) / 10;
      const tooFar = kmRounded > CONFIG.DELIVERY_MAX_KM;
      Object.assign(deliveryState, {
        status: tooFar ? "far" : "ok",
        km: kmRounded,
        fee: tooFar ? 0 : deliveryFeeForKm(kmRounded),
        lat: point.lat,
        lng: point.lng,
        label: point.label || "",
        source,
        query,
        estimated,
        approx: !!point.approx,
        message: "",
      });
    }
  } catch (e) {
    if (runId !== deliveryRunId) return;
    console.error("คำนวณค่าจัดส่งไม่สำเร็จ", e);
    Object.assign(deliveryState, {
      status: "error",
      source: "",
      message:
        e && e.code === 1
          ? "ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง กรุณาเปิดสิทธิ์ตำแหน่งในเบราว์เซอร์ หรือพิมพ์ที่อยู่แล้วกด “คำนวณค่าจัดส่ง”"
          : "คำนวณระยะทางไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง",
    });
  }

  renderDeliveryInfo();
  // ถ้าแนบสลิปไว้แล้วแต่ยอดเปลี่ยนเพราะค่าส่งใหม่ ให้เตือนลูกค้า
  if (typeof slipFiles !== "undefined" && slipFiles.length && deliveryFeeNow() !== prevFee) {
    showToast(`ค่าจัดส่งเปลี่ยน ยอดรวมใหม่ ${cartTotal().toLocaleString()} บาท — ตรวจสลิปว่าตรงกับยอดใหม่ด้วยนะคะ`);
  }
}

/* ---------- ปุ่มต่างๆ ---------- */
document.getElementById("deliveryCalcBtn").addEventListener("click", () => {
  const text = document.getElementById("custAddress").value.trim();
  if (!text) {
    showToast("กรุณากรอกที่อยู่จัดส่งก่อนคำนวณค่าจัดส่ง");
    return;
  }
  runDelivery(() => geocodeAddress(text), "address", text);
});

document.getElementById("deliveryGpsBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    showToast("อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง กรุณาพิมพ์ที่อยู่แทน");
    return;
  }
  runDelivery(
    () =>
      new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "ตำแหน่งปัจจุบันของอุปกรณ์" }),
          reject,
          { enableHighAccuracy: true, timeout: 10000 }
        )
      ),
    "gps",
    ""
  );
});

// แก้ที่อยู่หลังคำนวณจากที่อยู่แล้ว → ต้องคำนวณใหม่ (กรณีใช้ GPS ไม่รีเซ็ต เพราะพิมพ์เพิ่มรายละเอียดได้)
document.getElementById("custAddress").addEventListener("input", (e) => {
  if (deliveryState.source === "address" && e.target.value.trim() !== deliveryState.query) resetDelivery();
});

// ต้องคำนวณค่าจัดส่งให้เสร็จก่อนแนบสลิป เพื่อให้ยอดที่ตรวจสลิปตรงกับยอดจริง
document.getElementById("slipDrop").addEventListener("click", (e) => {
  if (deliveryState.status !== "ok") {
    e.preventDefault();
    showToast("กรุณากด “คำนวณค่าจัดส่ง” ให้เสร็จก่อนแนบสลิป เพื่อให้ยอดโอนตรงกับยอดรวม");
  }
});

renderDeliveryInfo();

document.getElementById("deliveryRule").textContent =
  `จัดส่งจาก${CONFIG.DELIVERY_ORIGIN.name} ไม่เกิน ${CONFIG.DELIVERY_MAX_KM} กม. • ` +
  `${CONFIG.DELIVERY_FREE_KM} กม.แรกส่งฟรี • ${CONFIG.DELIVERY_FREE_KM + 1}–${CONFIG.DELIVERY_MAX_KM} กม. ค่าส่ง ${CONFIG.DELIVERY_FEE} บาท`;
