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
  fulfillmentMode: "delivery",
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
  if (deliveryState.fulfillmentMode === "pickup") return "";
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

function parseCoordinatePair(value) {
  const match = String(value).match(/(-?\d{1,2}(?:\.\d+)?)\s*[,~]\s*(-?\d{1,3}(?:\.\d+)?)/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

function parseMapLocation(text) {
  const raw = text.trim();
  const urls = raw.match(/https?:\/\/[^\s<>"']+/gi) || [];
  const candidates = [];

  for (const rawUrl of urls) {
    const link = rawUrl.replace(/[),.;\]}]+$/, "");
    let url;
    try {
      url = new URL(link);
    } catch (e) {
      continue;
    }

    const markerCoordinates =
      link.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/) ||
      link.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (markerCoordinates) {
      const point = parseCoordinatePair(`${markerCoordinates[1]},${markerCoordinates[2]}`);
      if (point) return { point, query: candidates[0] || "", label: candidates[0] || "พิกัดจากลิงก์แผนที่" };
    }

    for (const key of ["ll", "center", "cp", "destination", "daddr", "to", "query", "q", "address", "where", "where1"]) {
      const value = url.searchParams.get(key);
      if (!value) continue;
      const point = parseCoordinatePair(value);
      if (point) return { point, query: candidates[0] || "", label: candidates[0] || "พิกัดจากลิงก์แผนที่" };
      if (["query", "q", "address", "destination", "daddr", "where", "where1", "to"].includes(key)) {
        candidates.push(value.trim());
      }
    }

    const path = decodeURIComponent(url.pathname).replace(/\+/g, " ");
    const placeMatch = path.match(/\/maps\/(?:place|search)\/([^/]+)/i);
    if (placeMatch) candidates.push(placeMatch[1].replace(/,/g, " ").trim());
  }

  const plainPoint = parseCoordinatePair(raw);
  if (plainPoint) return { point: plainPoint, query: "", label: "พิกัดที่ระบุ" };

  const sharedText = raw.replace(/https?:\/\/[^\s<>"']+/gi, "").trim();
  const query = candidates.find(Boolean) || sharedText || "";
  return { point: null, query };
}

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

async function reverseGeocode(point) {
  const params = new URLSearchParams({
    lat: String(point.lat),
    lon: String(point.lng),
    format: "jsonv2",
    "accept-language": "th",
  });
  try {
    const res = await fetch("https://nominatim.openstreetmap.org/reverse?" + params.toString());
    if (!res.ok) return "";
    const data = await res.json();
    return data.display_name || "";
  } catch (e) {
    return "";
  }
}

async function geocodeAddress(text) {
  const parsed = parseMapLocation(text);
  if (parsed.point) {
    return { ...parsed.point, label: (await reverseGeocode(parsed.point)) || parsed.label };
  }
  if (!parsed.query) return null;

  const full = await nominatimSearch(parsed.query);
  if (full) return { ...full, approx: false };
  // ที่อยู่ละเอียดเกินไปจนหาไม่เจอ → ลองใช้ 3 คำท้าย (ตำบล/อำเภอ/จังหวัด) แต่ถือเป็นค่าประมาณ
  const tokens = parsed.query.split(/[\s,]+/).filter(Boolean);
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
  const rule = document.getElementById("deliveryRule");
  if (s.fulfillmentMode === "pickup") {
    rule.textContent = `รับหน้าร้านที่${CONFIG.DELIVERY_ORIGIN.name}`;
  } else {
    rule.textContent =
      `จัดส่งจาก${CONFIG.DELIVERY_ORIGIN.name} ไม่เกิน ${CONFIG.DELIVERY_MAX_KM} กม. • ` +
      `${CONFIG.DELIVERY_FREE_KM} กม.แรกส่งฟรี • ${CONFIG.DELIVERY_FREE_KM + 1}–${CONFIG.DELIVERY_MAX_KM} กม. ค่าส่ง ${CONFIG.DELIVERY_FEE} บาท`;
  }
  if (s.fulfillmentMode === "pickup" && s.status === "ok") {
    el.classList.add("delivery-box__info--ok");
    el.replaceChildren(document.createTextNode(`รับหน้าร้านที่${CONFIG.DELIVERY_ORIGIN.name} `));
    const mapLink = document.createElement("a");
    mapLink.href = `https://www.google.com/maps/search/?api=1&query=${CONFIG.DELIVERY_ORIGIN.lat},${CONFIG.DELIVERY_ORIGIN.lng}`;
    mapLink.target = "_blank";
    mapLink.rel = "noopener noreferrer";
    mapLink.textContent = "เปิดแผนที่ร้าน";
    el.append(mapLink);
  } else if (s.status === "loading") {
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
    status: "idle", fulfillmentMode: "delivery", km: null, fee: 0, lat: null, lng: null,
    label: "", source: "", query: "", estimated: false, approx: false, message: "",
  });
  renderDeliveryInfo();
}

function setFulfillmentMode(mode) {
  deliveryRunId += 1;
  const isPickup = mode === "pickup";
  document.getElementById("deliveryAddressSection").hidden = isPickup;
  document.getElementById("deliveryActions").hidden = isPickup;
  if (isPickup) {
    Object.assign(deliveryState, {
      status: "ok",
      fulfillmentMode: "pickup",
      km: 0,
      fee: 0,
      lat: CONFIG.DELIVERY_ORIGIN.lat,
      lng: CONFIG.DELIVERY_ORIGIN.lng,
      label: CONFIG.DELIVERY_ORIGIN.name,
      source: "pickup",
      query: "",
      estimated: false,
      approx: false,
      message: "",
    });
    renderDeliveryInfo();
  } else {
    resetDelivery();
  }
}

async function runDelivery(getPoint, source, query) {
  const runId = (deliveryRunId += 1);
  const prevFee = deliveryFeeNow();
  Object.assign(deliveryState, { status: "loading", fulfillmentMode: "delivery", km: null, fee: 0 });
  renderDeliveryInfo();

  try {
    const point = await getPoint();
    if (runId !== deliveryRunId) return;
    if (!point) {
      Object.assign(deliveryState, {
        status: "error",
        source: "",
        message: "หาตำแหน่งจากที่อยู่หรือลิงก์นี้ไม่เจอ ลิงก์แบบย่ออาจไม่มีพิกัด กรุณาวางชื่อสถานที่ ที่อยู่เต็ม หรือพิกัดจากแผนที่แทน",
      });
    } else {
      if (source === "gps") {
        document.getElementById("custAddress").value =
          `พิกัดตำแหน่งปัจจุบัน: ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;
      }
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
document.querySelectorAll('input[name="fulfillmentMode"]').forEach((input) => {
  input.addEventListener("change", () => setFulfillmentMode(input.value));
});

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
