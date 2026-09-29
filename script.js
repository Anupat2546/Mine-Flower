/* CONFIG, PRODUCTS ราคาพิเศษ, GALLERY_IMAGES, DEFAULT_INVENTORY และฟังก์ชัน
   loadInventory/saveInventory ถูกย้ายไปอยู่ที่ inventory-config.js (โหลดร่วมกัน
   กับหน้า admin.html) — ไฟล์นี้จึงเหลือแค่ตัวแปรสินค้าสำเร็จรูปกับ logic ของ
   หน้าร้านเท่านั้น */

/* ============================================================
   สินค้าสำเร็จรูป — แก้ไข/เพิ่ม/ลบช่อดอกไม้ได้ตรงนี้
   ============================================================ */
const PRODUCTS = [
  { id: "p1", name: "Crimson Celebration", desc: "ช่อดอกไม้โทนสีจัดจ้าน โดดเด่นด้วยกุหลาบแดง ขาว ชมพู ตัดกับกระดาษห่อสีแดงเข้ม ให้ความรู้สึกหรูหรา ถือแล้วเด่นสะดุดตา เหมาะสำหรับงานรับปริญญาหรืองานฉลองความสำเร็จ", 
    price: 850, color: "var(--rose)", img: "image/products/Pink Melody.jpg" },
  { id: "p2", name: "Golden Sunshine", desc: "ช่อกุหลาบสีเหลืองสดใสแซมยิปโซฟูสวย ห่อกระดาษขาวผูกโบว์ทอง ให้ความรู้สึกสดชื่น ร่าเริง และเต็มไปด้วยพลังบวก เหมาะสำหรับวันรับปริญญา แสดงความยินดี หรือให้เพื่อนสนิท", 
    price: 1650, color: "var(--sage)", img: "image/products/Golden Sunshine.jpg" },
  { id: "p3", name: "Modern Love Letter", desc: "ช่อกุหลาบแดงจัดทรงกว้าง แซมยิปโซ ห่อด้วยกระดาษพิมพ์ลายตัวหนังสือสไตล์โมเดิร์น สื่อถึงจดหมายรักยุคใหม่ที่เต็มไปด้วยความใส่ใจ เหมาะสำหรับมอบให้คนพิเศษในวันสำคัญ", 
    price: 1900, color: "var(--gold)", img: "image/products/Modern Love Letter.jpg" },
  { id: "p4", name: "Velvet Romance", desc: "ช่อกุหลาบชมพูอมม่วงจัดทรงกลมแน่น ห่อกระดาษจีบสีชมพูละมุนสไตล์เกาหลี สื่อถึงความรักที่หวานซึ้ง มีเสน่ห์น่าค้นหา เหมาะสำหรับวันเกิด แฟนสาว หรือวันครบรอบสุดโรแมนติก", 
    price: 3000, color: "var(--rose-deep)", img: "image/products/Velvet Romance.jpg" },
  { id: "p5", name: "Scarlet Passion", desc: "ช่อกุหลาบแดงคลาสสิกทรงสูง คลุมด้วยกระดาษห่อสีขาวเรียบหรูและโบว์แดง สื่อถึงความรักที่มั่นคง ลึกซึ้ง และตรงไปตรงมา เหมาะสำหรับวันวาเลนไทน์หรือวันครบรอบ", 
    price: 850, color: "var(--sage)", img: "image/products/Scarlet Passion.jpg" },
  { id: "p6", name: "Soft Blossom", desc: "ช่อกุหลาบสีชมพูหวานละมุน แซมใบยูคาลิปตัสและยิปโซ ห่อกระดาษชมพูพาสเทล ให้ลุคเรียบหรู น่ารัก สบายตา เหมาะสำหรับให้เพื่อน คนรัก หรือโอกาสพิเศษทั่วไป", 
    price: 1150, color: "var(--rose)", img: "image/products/Soft Blossom.jpg" }, 
  { id: "p7", name: "Sunset Vibes", desc: "ช่อดอกไม้ผสมผสานดอกเยอบีร่าสีส้มและกุหลาบแดง ตัดกับกระดาษห่อสีม่วงพาสเทล ให้ความรู้สึกสดใส มีชีวิตชีวา เหมือนแสงอาทิตย์ยามเย็น เหมาะสำหรับวันรับปริญญาหรืองานแสดงความยินดี", 
    price: 2000, color: "var(--rose)", img: "image/products/Sunset Vibes.jpg" },
  { id: "p8", name: "Pink Melody", desc: "ช่อกุหลาบชมพูแซมยิปโซฟูสไตล์ Korean Sweet Minimal เหมาะสำหรับมอบให้คนพิเศษในวันครบรอบ วันเกิด หรือวันรับปริญญา เพื่อสื่อถึงความรักอันหวานซึ้งและละมุนหัวใจ", 
    price: 850, color: "var(--rose)", img: "image/products/Pink Melody.jpg" },

];

/* ============================================================
   GALLERY — รูปหน้าร้าน / บรรยากาศร้าน / ผลงานที่ผ่านมา
   ============================================================ */
const GALLERY_IMAGES = [
  // "images/gallery/shop-front.jpg",
];

// โหลดสต็อกปัจจุบัน (ค่าที่เจ้าของร้านตั้งไว้ผ่าน admin.html ถ้ามี)
let INVENTORY = loadInventory();

/* ============================================================
   FLOWER ICON (SVG แบบ inline ใช้กับทุกการ์ด)
   ============================================================ */
function flowerIcon(color) {
  return `
  <svg viewBox="0 0 100 100" width="72" height="72">
    <g>
      <ellipse cx="50" cy="34" rx="16" ry="24" fill="${color}" opacity="0.9"/>
      <ellipse cx="50" cy="34" rx="16" ry="24" fill="${color}" opacity="0.6" transform="rotate(72 50 50)"/>
      <ellipse cx="50" cy="34" rx="16" ry="24" fill="${color}" opacity="0.75" transform="rotate(144 50 50)"/>
      <ellipse cx="50" cy="34" rx="16" ry="24" fill="${color}" opacity="0.6" transform="rotate(216 50 50)"/>
      <ellipse cx="50" cy="34" rx="16" ry="24" fill="${color}" opacity="0.85" transform="rotate(288 50 50)"/>
      <circle cx="50" cy="50" r="10" fill="var(--gold)"/>
      <path d="M50 60 L46 92" stroke="var(--sage)" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M46 78 Q36 78 34 68" stroke="var(--sage)" stroke-width="3" stroke-linecap="round" fill="none"/>
    </g>
  </svg>`;
}

/* ============================================================
   CART — เก็บเป็น array ของรายการ (รองรับทั้งสินค้าสำเร็จรูปและช่อ custom)
   แต่ละรายการ: { lineId, name, price, qty, img?, note? }
   ============================================================ */
let cart = JSON.parse(localStorage.getItem("mf_cart") || "[]");

function saveCart() {
  localStorage.setItem("mf_cart", JSON.stringify(cart));
  renderCart();
  renderCartCount();
}

function addToCart(productId) {
  const p = PRODUCTS.find((x) => x.id === productId);
  if (!p) return;
  const existing = cart.find((l) => l.lineId === productId);
  if (existing) existing.qty += 1;
  else cart.push({ lineId: productId, name: p.name, price: p.price, qty: 1, img: p.img, note: "" });
  saveCart();
  showToast("เพิ่มลงตะกร้าแล้ว 🌸");
}

function addCustomToCart(name, price, note) {
  const lineId = "custom-" + Date.now();
  cart.push({ lineId, name, price, qty: 1, img: "", note });
  saveCart();
}

function changeQty(lineId, delta) {
  const line = cart.find((l) => l.lineId === lineId);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter((l) => l.lineId !== lineId);
  saveCart();
}

function removeFromCart(lineId) {
  cart = cart.filter((l) => l.lineId !== lineId);
  saveCart();
}

// ค่าดอกไม้อย่างเดียว (ยังไม่รวมค่าจัดส่ง)
function cartSubtotal() {
  return cart.reduce((sum, l) => sum + l.price * l.qty, 0);
}

// ยอดที่ลูกค้าต้องโอน = ค่าดอกไม้ + ค่าจัดส่ง (deliveryFeeNow มาจาก delivery.js)
function cartTotal() {
  if (cart.length === 0) return 0;
  return cartSubtotal() + (typeof deliveryFeeNow === "function" ? deliveryFeeNow() : 0);
}

function cartCount() {
  return cart.reduce((sum, l) => sum + l.qty, 0);
}

/* ============================================================
   RENDER: PRODUCT GRID (สินค้าสำเร็จรูป + การ์ด "ออกแบบเอง")
   ============================================================ */
function renderProducts() {
  const grid = document.getElementById("productGrid");
  const productCards = PRODUCTS.map(
    (p) => `
    <div class="card">
      <div class="card__art">${p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">` : flowerIcon(p.color)}</div>
      <div class="card__body">
        <h3 class="card__name">${p.name}</h3>
        <p class="card__desc">${p.desc}</p>
        <div class="card__row">
          <span class="card__price">${p.price.toLocaleString()} บาท</span>
          <button class="btn btn--primary btn--sm" data-add="${p.id}">ใส่ตะกร้า</button>
        </div>
      </div>
    </div>`
  ).join("");

  const customCard = `
    <div class="card card--custom">
      <div class="card__art card__art--custom">
        <svg viewBox="0 0 100 100" width="60" height="60"><path d="M50 20 L58 40 L80 40 L62 54 L70 76 L50 62 L30 76 L38 54 L20 40 L42 40 Z" fill="var(--gold)"/></svg>
      </div>
      <div class="card__body">
        <h3 class="card__name">ออกแบบช่อของคุณเอง</h3>
        <p class="card__desc">เลือกชนิดดอก สี กระดาษห่อ และโบว์ ได้ตามใจคุณ</p>
        <div class="card__row">
          <span class="card__price">เริ่ม ${CONFIG.CUSTOM_BASE_PRICE.toLocaleString()} บาท</span>
          <button class="btn btn--ghost btn--sm" id="openBuilderBtn">เริ่มออกแบบ</button>
        </div>
      </div>
    </div>`;

  grid.innerHTML = productCards + customCard;

  grid.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
  document.getElementById("openBuilderBtn").addEventListener("click", openBuilder);
}

/* ============================================================
   CUSTOM BOUQUET BUILDER
   ============================================================ */
// flowerTypes / flowerColors: เลือกได้หลายรายการ พร้อมระบุจำนวนแต่ละรายการ
// เก็บเป็น { [id]: qty } เช่น { rose: 3, tulip: 2 }
// wraps / bows: ยังเลือกได้แบบเดียวต่อช่อ (id หรือ null) เหมือนเดิม
let builderChoice = { flowerTypes: {}, flowerColors: {}, wraps: null, bows: null };

const BUILDER_SECTIONS = [
  { key: "flowerTypes", label: "ชนิดดอกไม้", mode: "qty" },
  { key: "flowerColors", label: "สีดอกไม้", mode: "qty" },
  { key: "wraps", label: "กระดาษ/ห่อช่อ", mode: "single" },
  { key: "bows", label: "โบว์", mode: "single" },
];

/* ----- กติกาช่อออกแบบเอง (ปรับตัวเลขตรงนี้ได้ถ้าเจ้าของร้านต้องการเปลี่ยน) -----
   1) รวมทั้งช่อต้องมี "ชนิดดอกไม้" อย่างน้อย MIN_TOTAL_FLOWERS ดอก ถึงจะสั่งได้ (กติกาพื้นฐาน
      สำหรับดอกไม้ทั่วไปที่ไม่มีขั้นต่ำเฉพาะตัว)
   2) ดอกไม้ 3 ชนิดพิเศษ (กุหลาบ / เยอบีร่า / ทานตะวัน) มีขั้นต่ำ+สูตรราคาของตัวเอง
      ไม่เกี่ยวกับดอกไม้ชนิดอื่นที่เลือกร่วมในช่อ:
      - เลือกแล้วต้องเลือกให้ครบขั้นต่ำของชนิดนั้นทันที (เป็นได้แค่ 0 หรือ >= ขั้นต่ำ เลือกครึ่งๆ กลางๆ ไม่ได้
        ปุ่ม +/- ในหน้าตัวออกแบบช่อจะกระโดดข้ามค่าที่เลือกไม่ได้ให้อัตโนมัติ)
      - กุหลาบ: ขั้นต่ำ 3 ดอก = รวมในราคาเหมา 450 บาทแล้ว (ไม่บวกเพิ่ม)
                ดอกที่ 4-9 บวกทีละ 150 บาท/ดอก (450→600→750→900→1050→1200→1350 ที่ดอกที่ 9)
                ดอกที่ 10 เป็นต้นไป บวกทีละ 100 บาท/ดอก ต่อจาก 1350 (ดอกที่10 = 1450, ดอกที่11 = 1550, ...)
      - เยอบีร่า: ขั้นต่ำ 3 ดอก = รวมในราคาเหมา 450 บาทแล้ว
                 ดอกที่ 4 เป็นต้นไป บวกทีละ 150 บาท/ดอกไปเรื่อยๆ ไม่มีจุดลดอัตรา
      - ทานตะวัน: เลือกครั้งแรกต้องครบ 2 ดอก รวมเป็น 800 บาท (บวกจากฐาน 450 อยู่ 350 บาท)
                 ดอกที่ 3 เป็นต้นไป เลือกเพิ่มได้ทีละ 1 ดอก บวกทีละ 300 บาท/ดอก (2 ดอก=800, 3 ดอก=1100, 4 ดอก=1400, ...)
   3) ดอกไม้ชนิดอื่นๆ ที่ไม่มีสูตรพิเศษ ยังใช้กติกาเดิม: เริ่มคิดราคาบวกเพิ่ม (ตาม priceAdd จากหน้า admin)
      ก็ต่อเมื่อรวมทั้งช่อ (ทุกชนิดรวมกัน) ตั้งแต่ FLOWER_SURCHARGE_FROM ดอกขึ้นไป
   4) จำนวน "สีดอกไม้" รวมกัน ต้องไม่เกินจำนวน "ชนิดดอกไม้" รวมกันที่เลือกไว้
   ------------------------------------------------------------------------ */
const MIN_TOTAL_FLOWERS = 3;        // ขั้นต่ำรวมของทั้งช่อ (ใช้กับดอกไม้ทั่วไปที่ไม่มีขั้นต่ำเฉพาะตัว)
const FLOWER_SURCHARGE_FROM = 4;    // ดอกไม้ทั่วไป (ไม่มีสูตรพิเศษ) เริ่มคิดราคาบวกเพิ่มเมื่อรวมทั้งช่อครบกี่ดอก

// ขั้นต่ำเฉพาะของดอกไม้แต่ละชนิดพิเศษ — เลือกแล้วต้องเลือกให้ครบขั้นต่ำ (หรือไม่เลือกเลย)
const ROSE_MIN_QTY = 3;
const GERBERA_MIN_QTY = 3;
const SUNFLOWER_MIN_QTY = 2;

function isFlowerKind(item, id, thaiKeyword) {
  return item.id === id || (item.name && item.name.includes(thaiKeyword));
}
function isRose(item) { return isFlowerKind(item, "rose", "กุหลาบ"); }
function isGerbera(item) {
  return item.id === "gerbera" || (item.name && (item.name.includes("เยอบีร่า") || item.name.includes("เยอบีรา")));
}
function isSunflower(item) { return isFlowerKind(item, "sunflower", "ทานตะวัน"); }
const ROSE_COLOR_IDS = new Set(["red", "pink", "yellow", "white", "purple"]);
const GERBERA_COLOR_IDS = new Set(["red", "pink", "yellow", "white", "purple"]);
const GERBERA_COLOR_STOCK = 30;

function hasSelectedFlower(predicate) {
  return Object.entries(builderChoice.flowerTypes).some(([id, qty]) => {
    const item = INVENTORY.flowerTypes.find((it) => it.id === id);
    return qty > 0 && item && predicate(item);
  });
}

function getAllowedFlowerColorIds() {
  const allowed = new Set();
  if (hasSelectedFlower(isRose)) {
    ROSE_COLOR_IDS.forEach((id) => allowed.add(id));
  }
  if (hasSelectedFlower(isGerbera)) {
    GERBERA_COLOR_IDS.forEach((id) => allowed.add(id));
  }
  return allowed;
}

function getFlowerColorStock(item) {
  return item && hasSelectedFlower(isGerbera) && GERBERA_COLOR_IDS.has(item.id)
    ? GERBERA_COLOR_STOCK
    : item ? item.stock : 0;
}

// คืนค่าขั้นต่ำเฉพาะของชนิดดอกไม้นั้น (null = ไม่ใช่ดอกไม้พิเศษ ไม่มีขั้นต่ำเฉพาะ)
function specialMinQty(item) {
  if (isRose(item)) return ROSE_MIN_QTY;
  if (isGerbera(item)) return GERBERA_MIN_QTY;
  if (isSunflower(item)) return SUNFLOWER_MIN_QTY;
  return null;
}

// ราคาบวกเพิ่มของดอกไม้ "1 ชนิด" ตามจำนวนที่เลือก
// - ดอกไม้พิเศษ (กุหลาบ/เยอบีร่า/ทานตะวัน): คิดจากจำนวนของชนิดนั้นเองล้วนๆ ใช้ได้ทันทีไม่ต้องรอ FLOWER_SURCHARGE_FROM
// - ดอกไม้ทั่วไป: อ้าง priceAdd จากหน้า admin (เงื่อนไข FLOWER_SURCHARGE_FROM เช็คที่ computeBuilderPricing ก่อนเรียกฟังก์ชันนี้)
function flowerTypeSurcharge(item, qty) {
  if (qty <= 0) return 0;

  if (isRose(item)) {
    // 3 ดอกแรก รวมในราคาเหมาแล้ว (ไม่บวกเพิ่ม)
    // ดอกที่ 4-9 บวกทีละ 150 บาท/ดอก (นับจากดอกที่ 4 เป็นต้นไป)
    // ดอกที่ 10 เป็นต้นไป บวกทีละ 100 บาท/ดอก ต่อยอดจากฐานที่ดอกที่ 9
    if (qty <= ROSE_MIN_QTY) return 0;
    if (qty <= 9) return 150 * (qty - ROSE_MIN_QTY);
    return 150 * (9 - ROSE_MIN_QTY) + 100 * (qty - 9);
  }

  if (isGerbera(item)) {
    // 3 ดอกแรก รวมในราคาเหมาแล้ว
    // ดอกที่ 4 เป็นต้นไป บวกทีละ 150 บาท/ดอกไปเรื่อยๆ ไม่มีจุดลดอัตรา
    if (qty <= GERBERA_MIN_QTY) return 0;
    return 150 * (qty - GERBERA_MIN_QTY);
  }

  if (isSunflower(item)) {
    // เลือกครั้งแรกต้องครบ 2 ดอก = รวม 800 บาท (บวกจากฐาน 450 อยู่ 350 บาท)
    // ดอกที่ 3 เป็นต้นไป เลือกเพิ่มทีละ 1 ดอกได้ บวกทีละ 300 บาท/ดอก
    if (qty < SUNFLOWER_MIN_QTY) return 0;
    if (qty === SUNFLOWER_MIN_QTY) return 350;
    return 350 + 300 * (qty - SUNFLOWER_MIN_QTY);
  }

  // ดอกอื่นๆ ที่ไม่มีสูตรพิเศษ ใช้ราคาบวกเพิ่มต่อดอกตามที่ตั้งไว้ในหน้า admin เหมือนเดิม
  return (item.priceAdd || 0) * qty;
}

// ราคาของดอกไม้แต่ละชนิดคิดแยกกัน แล้วนำมารวมเป็นราคาช่อ
function flowerTypePrice(item, qty) {
  if (qty <= 0) return 0;
  if (isRose(item)) {
    if (qty <= ROSE_MIN_QTY) return 450;
    if (qty <= 9) return 450 + 150 * (qty - ROSE_MIN_QTY);
    return 1350 + 100 * (qty - 9);
  }
  if (isGerbera(item)) return 450 + 150 * Math.max(0, qty - GERBERA_MIN_QTY);
  if (isSunflower(item)) return 800 + 300 * Math.max(0, qty - SUNFLOWER_MIN_QTY);
  return CONFIG.CUSTOM_BASE_PRICE + (item.priceAdd || 0) * qty;
}

// ข้อความอธิบายราคาต่อดอก แสดงใต้ชื่อในหมวด "ชนิดดอกไม้"
function flowerTypeSurchargeLabel(item) {
  if (isRose(item)) return `เลือกขั้นต่ำ ${ROSE_MIN_QTY} ดอก = รวมในราคาเหมา / ดอกที่ 4-9 +150฿ต่อดอก / ดอกที่ 10 ขึ้นไป +100฿ต่อดอก`;
  if (isGerbera(item)) return `เลือกขั้นต่ำ ${GERBERA_MIN_QTY} ดอก = รวมในราคาเหมา / ดอกที่ 4 ขึ้นไป +150฿ต่อดอก`;
  if (isSunflower(item)) return `เลือกครั้งแรกต้องครบ ${SUNFLOWER_MIN_QTY} ดอก (รวมเป็น 800฿) / ดอกที่ 3 ขึ้นไป +300฿ต่อดอก`;
  return item.priceAdd ? `+${item.priceAdd}฿/ดอก เมื่อรวมครบ ${FLOWER_SURCHARGE_FROM} ดอกขึ้นไป` : "";
}

function renderBuilder() {
  const body = document.getElementById("builderBody");
  const flowerTypeTotal = Object.values(builderChoice.flowerTypes).reduce((a, b) => a + b, 0);
  const flowerColorTotal = Object.values(builderChoice.flowerColors).reduce((a, b) => a + b, 0);
  const hasSunflower = hasSelectedFlower(isSunflower);
  const hasColorableFlower = hasSelectedFlower((item) => isRose(item) || isGerbera(item));
  const allowedFlowerColorIds = getAllowedFlowerColorIds();

  body.innerHTML = BUILDER_SECTIONS.map((section) => {
    const items = INVENTORY[section.key].filter((it) => it.active);
    if (items.length === 0) {
      return `<p class="drawer__form-title">${section.label}</p><p class="builder__empty">ยังไม่มีตัวเลือกในหมวดนี้</p>`;
    }
    if (section.key === "flowerColors" && hasSunflower && !hasColorableFlower) {
      return `<p class="drawer__form-title">${section.label}</p><p class="builder__empty">ดอกทานตะวันมีสีของดอกอยู่แล้ว ไม่ต้องเลือกสีเพิ่ม</p>`;
    }
    const sectionItems = section.key === "flowerColors" && hasColorableFlower
      ? items.filter((it) => allowedFlowerColorIds.has(it.id))
      : items;

    // ---- หมวดที่เลือกได้หลายรายการ + ระบุจำนวน (ชนิดดอกไม้ / สีดอกไม้) ----
    if (section.mode === "qty") {
      const isTypeSection = section.key === "flowerTypes";
      const isColorSection = section.key === "flowerColors";
      const sectionTotal = isTypeSection ? flowerTypeTotal : flowerColorTotal;

      const rows = sectionItems
        .map((it) => {
          const qty = builderChoice[section.key][it.id] || 0;
          // ขั้นต่ำเฉพาะตัว (เฉพาะหมวดชนิดดอกไม้ + ดอกไม้พิเศษ 3 ชนิด) — สีดอกไม้ไม่มีขั้นต่ำเฉพาะ
          const minQty = isTypeSection ? specialMinQty(it) : null;
          const availableStock = isColorSection ? getFlowerColorStock(it) : it.stock;

          // ก้าวกระโดดไม่เท่ากันสองทาง: จาก 0 ต้องกระโดดตรงไปขั้นต่ำเลย, จากขั้นต่ำจะถอยกลับ 0 ทีเดียว
          // ส่วนช่วงระหว่างขั้นต่ำกับสต็อกสูงสุด ปรับได้ทีละ 1 ดอกตามปกติ
          const increaseStep = minQty && qty === 0 ? minQty : 1;
          const decreaseStep = minQty && qty === minQty ? minQty : 1;

          const belowMin = minQty && availableStock < minQty; // สต็อกไม่พอขั้นต่ำของดอกไม้ชนิดนี้
          const outOfStock = availableStock <= 0 || belowMin;

          // เพิ่มได้อีกไหม: ต้องไม่เกินสต็อก และถ้าเป็นสีต้องไม่ทำให้ยอดรวมสีเกินยอดรวมชนิดดอกไม้
          let canIncrease = !outOfStock && qty + increaseStep <= availableStock;
          if (isColorSection) canIncrease = canIncrease && flowerColorTotal + increaseStep <= flowerTypeTotal;

          // ลดได้ไหม: ถ้าเป็นชนิดดอกไม้ ห้ามลดจนทำให้ยอดรวมชนิดดอกไม้ต่ำกว่ายอดรวมสีที่เลือกไว้แล้ว
          let canDecrease = qty >= decreaseStep;
          if (isTypeSection) canDecrease = canDecrease && flowerTypeTotal - decreaseStep >= flowerColorTotal;

          const priceLabel = isTypeSection
            ? flowerTypeSurchargeLabel(it)
            : it.priceAdd
              ? `+${it.priceAdd}฿/ดอก`
              : "";

          return `
          <div class="builder__qty-row ${qty > 0 ? "builder__qty-row--active" : ""} ${outOfStock ? "builder__qty-row--out" : ""}">
            ${it.hex ? `<span class="builder__qty-dot" style="background:${it.hex}"></span>` : ""}
            <div class="builder__qty-info">
              <div class="builder__qty-name">${it.name}${minQty ? ` <span class="builder__qty-note">(ขั้นต่ำ ${minQty} ดอก)</span>` : ""}</div>
              <div class="builder__qty-meta">
                ${priceLabel ? `<span class="builder__qty-price">${priceLabel}</span>` : ""}
                ${belowMin ? '<span class="swatch__badge">สต็อกไม่พอ</span>' : availableStock <= 0 ? '<span class="swatch__badge">หมด</span>' : `<span class="swatch__stock">เหลือ ${availableStock}</span>`}
              </div>
            </div>
            <div class="builder__qty-stepper">
              <button type="button" class="builder__qty-btn" data-section="${section.key}" data-id="${it.id}" data-delta="${-decreaseStep}" ${canDecrease ? "" : "disabled"} aria-label="ลดจำนวน ${it.name}">−</button>
              <span class="builder__qty-value">${qty}</span>
              <button type="button" class="builder__qty-btn" data-section="${section.key}" data-id="${it.id}" data-delta="${increaseStep}" ${canIncrease ? "" : "disabled"} aria-label="เพิ่มจำนวน ${it.name}">+</button>
            </div>
          </div>`;
        })
        .join("");

      let footNote = "";
      if (isTypeSection) {
        footNote = `<p class="builder__section-total">เลือกแล้ว ${sectionTotal} ดอก (ขั้นต่ำ ${MIN_TOTAL_FLOWERS} ดอก — ${MIN_TOTAL_FLOWERS} ดอกแรกรวมในราคาเหมาแล้ว)</p>`;
      } else if (isColorSection) {
        footNote = `<p class="builder__section-total">เลือกสีแล้ว ${sectionTotal} จาก ${flowerTypeTotal} ดอก (ห้ามเกินจำนวนชนิดดอกไม้)</p>`;
      }
      return `<p class="drawer__form-title">${section.label}</p><div class="builder__qty-list">${rows}</div>${footNote}`;
    }

    // ---- หมวดที่เลือกได้แบบเดียว (กระดาษห่อ / โบว์) ----
    const swatches = items
      .map((it) => {
        const outOfStock = it.stock <= 0;
        const selected = builderChoice[section.key] === it.id;
        return `
        <button type="button" class="swatch ${selected ? "swatch--selected" : ""} ${outOfStock ? "swatch--out" : ""}"
          data-section="${section.key}" data-id="${it.id}" ${outOfStock ? "disabled" : ""}>
          <span class="swatch__dot" style="background:${it.hex || "var(--rose)"}"></span>
          <span class="swatch__label">${it.name}${it.priceAdd ? ` (+${it.priceAdd}฿)` : ""}</span>
          ${outOfStock ? '<span class="swatch__badge">หมด</span>' : `<span class="swatch__stock">เหลือ ${it.stock}</span>`}
        </button>`;
      })
      .join("");
    return `<p class="drawer__form-title">${section.label}</p><div class="swatch__group">${swatches}</div>`;
  }).join("");

  // จำนวน +/- สำหรับชนิดดอกไม้/สี
  body.querySelectorAll(".builder__qty-btn").forEach((btn) => {
    if (btn.disabled) return;
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      const id = btn.dataset.id;
      const delta = Number(btn.dataset.delta);
      const item = INVENTORY[section].find((it) => it.id === id);
      const current = builderChoice[section][id] || 0;
      let next = current + delta;
      const maxStock = section === "flowerColors" ? getFlowerColorStock(item) : item && item.stock;
      if (next < 0) next = 0;
      if (item && next > maxStock) next = maxStock;
      if (next === 0) delete builderChoice[section][id];
      else builderChoice[section][id] = next;
      if (section === "flowerTypes" && item && isSunflower(item) && next > 0) {
        builderChoice.flowerColors = {};
      }
      renderBuilder();
    });
  });

  // เลือกแบบเดียวสำหรับกระดาษห่อ/โบว์
  body.querySelectorAll(".swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      const id = btn.dataset.id;
      builderChoice[section] = builderChoice[section] === id ? null : id;
      renderBuilder();
    });
  });

  updateBuilderTotal();
}

/* คำนวณราคารวม + เช็คว่ายังขาด/ผิดกติกาหมวดไหนอยู่ + สรุปรายการที่เลือกเป็นข้อความ
   ใช้ร่วมกันทั้งตอนอัปเดตยอดเงินระหว่างเลือก และตอนกดเพิ่มลงตะกร้าจริง */
function computeBuilderPricing() {
  let total = 0;
  let missing = [];
  let parts = [];

  const typeItems = INVENTORY.flowerTypes.filter((it) => it.active);
  const colorItems = INVENTORY.flowerColors.filter((it) => it.active);

  const chosenTypes = typeItems
    .map((it) => ({ item: it, qty: builderChoice.flowerTypes[it.id] || 0 }))
    .filter((x) => x.qty > 0);
  const hasColorableFlower = chosenTypes.some(({ item, qty }) => qty > 0 && (isRose(item) || isGerbera(item)));
  const allowedFlowerColorIds = new Set();
  if (chosenTypes.some(({ item, qty }) => qty > 0 && isRose(item))) {
    ROSE_COLOR_IDS.forEach((id) => allowedFlowerColorIds.add(id));
  }
  if (chosenTypes.some(({ item, qty }) => qty > 0 && isGerbera(item))) {
    GERBERA_COLOR_IDS.forEach((id) => allowedFlowerColorIds.add(id));
  }
  const chosenColors = colorItems
    .map((it) => ({ item: it, qty: builderChoice.flowerColors[it.id] || 0 }))
    .filter((x) => !hasColorableFlower || allowedFlowerColorIds.has(x.item.id))
    .filter((x) => x.qty > 0);

  const flowerTypeTotal = chosenTypes.reduce((sum, x) => sum + x.qty, 0);
  const flowerColorTotal = chosenColors.reduce((sum, x) => sum + x.qty, 0);
  const hasSunflower = chosenTypes.some(({ item, qty }) => qty > 0 && isSunflower(item));
  const hasSpecialFlower = chosenTypes.some(({ item }) => specialMinQty(item) !== null);

  // ---- ชนิดดอกไม้: ต้องเลือกรวมอย่างน้อย MIN_TOTAL_FLOWERS ดอก (ยกเว้นเลือกดอกไม้พิเศษจนครบขั้นต่ำของมันเองแล้ว) ----
  if (typeItems.length > 0) {
    if (flowerTypeTotal === 0) {
      missing.push("ชนิดดอกไม้");
    } else {
      // 1) เช็คก่อนว่าดอกไม้พิเศษ (กุหลาบ/เยอบีร่า/ทานตะวัน) ที่เลือกไว้ครบขั้นต่ำเฉพาะตัวหรือยัง
      const belowSpecialMin = chosenTypes.find(({ item, qty }) => {
        const m = specialMinQty(item);
        return m && qty < m;
      });
      if (belowSpecialMin) {
        const m = specialMinQty(belowSpecialMin.item);
        missing.push(`${belowSpecialMin.item.name} (ต้องเลือกอย่างน้อย ${m} ดอกถ้าจะเลือกดอกนี้)`);
      } else {
        // 2) ถ้ามีดอกไม้พิเศษที่เลือกไว้ครบขั้นต่ำของมันเองแล้ว (ผ่านข้อ 1 มาแล้ว) ถือว่าผ่านเกณฑ์
        //    ไม่ต้องบังคับรวมทั้งช่อให้ครบ MIN_TOTAL_FLOWERS อีก (เช่น ทานตะวันล้วน 2 ดอก ถือว่าผ่านแล้ว)
        //    แต่ถ้าเลือกแต่ดอกไม้ทั่วไป (ไม่มีดอกไม้พิเศษเลย) ยังต้องรวมให้ครบ MIN_TOTAL_FLOWERS เหมือนเดิม
        const hasValidSpecialSelection = chosenTypes.some(({ item, qty }) => specialMinQty(item) !== null && qty > 0);
        if (flowerTypeTotal < MIN_TOTAL_FLOWERS && !hasValidSpecialSelection) {
          missing.push(`ชนิดดอกไม้ (ต้องครบ ${MIN_TOTAL_FLOWERS} ดอก ตอนนี้เลือก ${flowerTypeTotal} ดอก)`);
        } else {
          chosenTypes.forEach(({ item, qty }) => {
            const isSpecial = specialMinQty(item) !== null;
            if (isSpecial) total += flowerTypePrice(item, qty);
            else if (flowerTypeTotal >= FLOWER_SURCHARGE_FROM) total += (item.priceAdd || 0) * qty;
          });
          if (!hasSpecialFlower) total = CONFIG.CUSTOM_BASE_PRICE + total;
          parts.push(`ชนิดดอกไม้: ${chosenTypes.map(({ item, qty }) => `${item.name} x${qty}`).join(", ")}`);
        }
      }
    }
  }

  // ---- สีดอกไม้: ต้องไม่เกินจำนวนชนิดดอกไม้ที่เลือกไว้ ----
  if (colorItems.length > 0 && (hasColorableFlower || !hasSunflower)) {
    if (flowerColorTotal === 0) {
      missing.push("สีดอกไม้");
    } else if (flowerColorTotal > flowerTypeTotal) {
      missing.push("สีดอกไม้ (จำนวนสีต้องไม่เกินจำนวนชนิดดอกไม้)");
    } else {
      chosenColors.forEach(({ item, qty }) => {
        total += (item.priceAdd || 0) * qty;
      });
      parts.push(`สีดอกไม้: ${chosenColors.map(({ item, qty }) => `${item.name} x${qty}`).join(", ")}`);
    }
  }

  // ---- กระดาษห่อ / โบว์: เลือกได้อย่างละ 1 แบบ เหมือนเดิม ----
  [
    { key: "wraps", label: "กระดาษ/ห่อช่อ" },
    { key: "bows", label: "โบว์" },
  ].forEach(({ key, label }) => {
    const items = INVENTORY[key].filter((it) => it.active);
    if (items.length === 0) return;
    const choiceId = builderChoice[key];
    if (!choiceId) {
      missing.push(label);
      return;
    }
    const item = items.find((it) => it.id === choiceId);
    if (item) {
      total += item.priceAdd || 0;
      parts.push(`${label}: ${item.name}`);
    }
  });

  return { total, missing, parts };
}

function updateBuilderTotal() {
  const { total, missing } = computeBuilderPricing();
  document.getElementById("builderTotal").textContent = total.toLocaleString() + " บาท";
  const hint = document.getElementById("builderHint");
  const addBtn = document.getElementById("builderAdd");
  if (missing.length) {
    hint.textContent = `กรุณาเลือก: ${missing.join(", ")}`;
    addBtn.disabled = true;
  } else {
    hint.textContent = "เลือกครบแล้ว กดเพิ่มลงตะกร้าได้เลย";
    addBtn.disabled = false;
  }
}

function openBuilder() {
  builderChoice = { flowerTypes: {}, flowerColors: {}, wraps: null, bows: null };
  renderBuilder();
  document.getElementById("builder").classList.add("open");
}

document.getElementById("builderClose").addEventListener("click", () => {
  document.getElementById("builder").classList.remove("open");
});
document.getElementById("builderBackdrop").addEventListener("click", () => {
  document.getElementById("builder").classList.remove("open");
});

document.getElementById("builderAdd").addEventListener("click", () => {
  const { total, missing, parts } = computeBuilderPricing();
  if (missing.length) return; // ปุ่มควรถูก disable ไว้แล้ว แต่กันเหนียวอีกชั้น
  addCustomToCart("ช่อออกแบบเอง", total, parts.join(" / "));
  document.getElementById("builder").classList.remove("open");
  showToast("เพิ่มช่อออกแบบเองลงตะกร้าแล้ว 🌷");
  document.getElementById("drawer").classList.add("open");
});

/* ============================================================
   RENDER: CART DRAWER
   ============================================================ */
function renderCart() {
  const wrap = document.getElementById("drawerItems");

  if (cart.length === 0) {
    wrap.innerHTML = `<p class="drawer__empty">ยังไม่มีสินค้าในตะกร้า — เลือกช่อดอกไม้ที่ถูกใจได้เลย 🌷</p>`;
  } else {
    wrap.innerHTML = cart
      .map((l) => {
        return `
        <div class="cart-item">
          <div class="cart-item__art">${l.img ? `<img src="${l.img}" alt="${l.name}" loading="lazy">` : flowerIcon("var(--rose)").replace(/width="72" height="72"/, 'width="30" height="30"')}</div>
          <div class="cart-item__info">
            <div class="cart-item__name">${l.name}</div>
            ${l.note ? `<div class="cart-item__note">${l.note}</div>` : ""}
            <div class="cart-item__price">${l.price.toLocaleString()} บาท</div>
          </div>
          <div class="cart-item__qty">
            <button data-dec="${l.lineId}">−</button>
            <span>${l.qty}</span>
            <button data-inc="${l.lineId}">+</button>
            <span class="cart-item__remove" data-remove="${l.lineId}">ลบ</span>
          </div>
        </div>`;
      })
      .join("");

    wrap.querySelectorAll("[data-inc]").forEach((b) => b.addEventListener("click", () => changeQty(b.dataset.inc, 1)));
    wrap.querySelectorAll("[data-dec]").forEach((b) => b.addEventListener("click", () => changeQty(b.dataset.dec, -1)));
    wrap.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => removeFromCart(b.dataset.remove)));
  }

  document.getElementById("cartSubtotal").textContent = cartSubtotal().toLocaleString() + " บาท";
  const feeEl = document.getElementById("cartDeliveryFee");
  if (typeof deliveryState !== "undefined" && deliveryState.status === "ok") {
    feeEl.textContent = deliveryState.fulfillmentMode === "pickup"
      ? "รับหน้าร้าน (ฟรี)"
      : deliveryState.fee === 0 ? "ฟรี" : deliveryState.fee.toLocaleString() + " บาท";
  } else {
    feeEl.textContent = "ยังไม่คำนวณ";
  }
  document.getElementById("cartTotal").textContent = cartTotal().toLocaleString() + " บาท";
}

function renderCartCount() {
  document.getElementById("cartCount").textContent = cartCount();
}

/* ============================================================
   DRAWER OPEN / CLOSE
   ============================================================ */
const drawer = document.getElementById("drawer");
document.getElementById("cartToggle").addEventListener("click", () => drawer.classList.add("open"));
document.getElementById("drawerClose").addEventListener("click", () => drawer.classList.remove("open"));
document.getElementById("drawerBackdrop").addEventListener("click", () => drawer.classList.remove("open"));

/* ============================================================
   MOBILE NAV (เมนูแฮมเบอร์เกอร์บนจอเล็ก — มือถือ/แท็บเล็ต)
   ============================================================ */
const navBurger = document.getElementById("navBurger");
const navMobile = document.getElementById("navMobile");
const navMobileBackdrop = document.getElementById("navMobileBackdrop");
const navMobileClose = document.getElementById("navMobileClose");

function setMobileNav(isOpen) {
  navMobile.classList.toggle("open", isOpen);
  navMobileBackdrop.classList.toggle("open", isOpen);
  navBurger.classList.toggle("open", isOpen);
  navBurger.setAttribute("aria-expanded", String(isOpen));
}
function closeMobileNav() { setMobileNav(false); }

navBurger.addEventListener("click", () => setMobileNav(!navMobile.classList.contains("open")));
navMobileClose.addEventListener("click", closeMobileNav);
navMobileBackdrop.addEventListener("click", closeMobileNav);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMobileNav(); });

// ปิดเมนูมือถืออัตโนมัติเมื่อกดลิงก์ในเมนู
navMobile.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMobileNav));

/* ============================================================
   TOAST
   ============================================================ */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ============================================================
   SLIP UPLOAD (รูปสลิปโอนเงิน)
   ============================================================ */
/* หมายเหตุ: ไม่ต้องดักคลิกที่ #slipDrop แล้วสั่ง .click() ซ้ำ เพราะ
   #slipInput ถูกวางไว้ข้างใน <label id="slipDrop"> อยู่แล้ว การคลิก label
   จะเปิดหน้าต่างเลือกไฟล์ให้เองโดยอัตโนมัติตามพฤติกรรมมาตรฐานของ HTML
   ถ้าสั่ง .click() ซ้ำอีกที จะเปิดหน้าต่างเลือกไฟล์ 2 ครั้งซ้อนกัน ทำให้
   event "change" ไม่ยิงตามปกติ (พบบ่อยบน Safari/iOS) รูปสลิปเลยไม่ถูกอ่าน */

// รองรับแนบได้หลายรูป ไม่จำกัดจำนวน/ไม่จำกัดชนิดไฟล์ภาพ (รูปแบบใดก็ได้ที่
// เบราว์เซอร์รู้จักว่าเป็นรูป — jpg, png, webp, heic ที่แปลงได้, ฯลฯ)
// slipFiles คือ array ของ { dataURL, blob } แต่ละรูปที่แนบไว้
let slipFiles = [];

function renderSlipPreview() {
  const wrap = document.getElementById("slipPreview");
  const dropText = document.getElementById("slipDropText");

  if (slipFiles.length === 0) {
    wrap.style.display = "none";
    wrap.innerHTML = "";
    dropText.textContent = "แตะเพื่อเลือกรูปสลิป";
    return;
  }

  const STATUS_LABEL = { checking: "กำลังตรวจสอบ…", ok: "ยอดตรง ✅", warn: "ตรวจสอบอีกครั้ง ⚠️", error: "ตรวจสอบไม่ได้", unavailable: "" };

  wrap.style.display = "flex";
  wrap.innerHTML =
    slipFiles
      .map((f, idx) => {
        const check = f.slipCheck;
        const badge = check && STATUS_LABEL[check.status]
          ? `<span class="slip__status slip__status--${check.status}" title="${(check.message || "").replace(/"/g, "&quot;")}">${STATUS_LABEL[check.status]}</span>`
          : "";
        return `
      <div class="slip__thumb" data-idx="${idx}">
        <img src="${f.dataURL}" alt="สลิปโอนเงิน ${idx + 1}">
        <button type="button" class="slip__thumb-remove" data-idx="${idx}" aria-label="ลบรูปนี้">✕</button>
        ${badge}
      </div>`;
      })
      .join("") +
    `<button type="button" id="slipRemove" class="slip__clear-all">ลบรูปสลิปทั้งหมด</button>`;

  wrap.querySelectorAll(".slip__thumb-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      slipFiles.splice(Number(btn.dataset.idx), 1);
      renderSlipPreview();
    });
  });

  document.getElementById("slipRemove").addEventListener("click", () => {
    slipFiles = [];
    document.getElementById("slipInput").value = "";
    renderSlipPreview();
  });

  dropText.textContent = `แนบแล้ว ${slipFiles.length} รูป (แตะเพื่อเพิ่มอีก)`;
}

/* ---------- ตรวจสลิปอัตโนมัติผ่าน SlipOK (ถ้าตั้งค่า CONFIG.SLIPOK_VERIFY_URL ไว้) ---------- */
// ความหมายของแต่ละ error code จาก SlipOK (อ้างอิงเอกสาร SlipOK API v1.8)
const SLIPOK_ERROR_MESSAGES = {
  1000: "อ่านข้อมูลจากสลิปไม่ได้ กรุณาแนบรูปใหม่",
  1001: "ระบบตรวจสลิปของร้านตั้งค่าไม่ถูกต้อง (ติดต่อร้านโดยตรง)",
  1002: "ระบบตรวจสลิปของร้านตั้งค่าไม่ถูกต้อง (ติดต่อร้านโดยตรง)",
  1003: "ระบบตรวจสลิปของร้านหมดอายุชั่วคราว (ติดต่อร้านโดยตรง)",
  1004: "ระบบตรวจสลิปของร้านใช้งานเกินโควต้าชั่วคราว (ติดต่อร้านโดยตรง)",
  1005: "ไฟล์ที่แนบไม่ใช่รูปภาพที่รองรับ กรุณาแนบไฟล์ JPG/PNG/WEBP",
  1006: "รูปสลิปไม่ชัดเจนหรือไม่ถูกต้อง กรุณาถ่าย/แนบรูปใหม่",
  1007: "ไม่พบ QR Code ในรูปสลิป กรุณาแนบรูปที่เห็น QR ขวาล่างชัดเจน",
  1008: "QR ในรูปนี้ไม่ใช่ QR สำหรับตรวจสอบการโอนเงิน",
  1009: "ข้อมูลธนาคารขัดข้องชั่วคราว กรุณาลองแนบใหม่อีกครั้งใน 15 นาที",
  1010: "สลิปนี้ต้องรอสักครู่ก่อนตรวจสอบได้ (ธนาคารยังไม่ยืนยันรายการ) กรุณาลองใหม่ภายหลัง",
  1011: "QR หมดอายุหรือไม่พบรายการโอนเงินนี้ในระบบธนาคาร",
  1012: "สลิปนี้เคยถูกใช้ยืนยันการชำระเงินมาก่อนแล้ว",
  1013: "ยอดเงินในสลิปไม่ตรงกับยอดที่ต้องชำระ",
  1014: "บัญชีปลายทางในสลิปไม่ตรงกับบัญชีหลักของร้าน",
};

// ส่งรูปสลิป + ยอดเงินที่คาดไว้ไปให้ Cloud Function "verifySlip" ตรวจสอบกับ SlipOK
// คืนค่า { status: "ok"|"warn"|"error"|"unavailable", message } เสมอ ไม่โยน error ออกไป
async function verifySlipWithSlipOK(dataURL, amount) {
  if (!CONFIG.SLIPOK_VERIFY_URL) {
    return { status: "unavailable", message: "" }; // ยังไม่ได้ตั้งค่าระบบตรวจสลิปอัตโนมัติ
  }
  try {
    const res = await fetch(CONFIG.SLIPOK_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: dataURL, amount }),
    });
    const result = await res.json();

    if (result && result.success === true) {
      return { status: "ok", message: "ตรวจสอบสลิปแล้ว ยอดและบัญชีตรงกัน ✅" };
    }
    const code = result && (result.code || (result.data && result.data.code));
    const fallback = (result && (result.message || (result.data && result.data.message))) || "ตรวจสอบสลิปไม่ผ่าน กรุณาตรวจสอบยอด/บัญชีอีกครั้ง";
    return { status: "warn", message: SLIPOK_ERROR_MESSAGES[code] || fallback };
  } catch (e) {
    return { status: "error", message: "เชื่อมต่อระบบตรวจสลิปไม่สำเร็จ (เช็คสลิปเองด้วยตานะคะ)" };
  }
}

// ขนาดสูงสุดของด้านยาวที่สุดของรูป (พิกเซล) — รูปที่ใหญ่กว่านี้จะถูกย่อ
// อัตโนมัติก่อนเก็บ เพื่อไม่ให้รูปความละเอียดสูงจากกล้องมือถือ (หลายสิบ MB)
// ทำให้เบราว์เซอร์ค้าง/หน่วยความจำเต็มจนแนบไม่ติด — รูปที่เล็กกว่านี้อยู่แล้ว
// จะไม่ถูกแตะต้อง ไม่มีการจำกัดขนาดไฟล์ต้นฉบับที่รับเข้ามาแต่อย่างใด
const MAX_SLIP_DIMENSION = 1600;
const SLIP_JPEG_QUALITY = 0.85;

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("อ่านไฟล์ไม่สำเร็จ"));
    reader.readAsDataURL(file);
  });
}

// ย่อรูปที่ใหญ่เกินไปด้วย canvas แล้วแปลงเป็น JPEG คุณภาพสูง — ถ้าเบราว์เซอร์
// ถอดรหัสรูปนี้ไม่ได้ (เช่นบางไฟล์ HEIC บน Android) จะโยน error กลับไปให้
// ผู้เรียกใช้ "รูปต้นฉบับ" ที่ FileReader อ่านมาแทน แทนที่จะทิ้งรูปนั้นไปเลย
function downscaleImage(dataURL) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      if (width <= MAX_SLIP_DIMENSION && height <= MAX_SLIP_DIMENSION) {
        resolve(dataURL);
        return;
      }
      const scale = MAX_SLIP_DIMENSION / Math.max(width, height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        resolve(canvas.toDataURL("image/jpeg", SLIP_JPEG_QUALITY));
      } catch (e) {
        resolve(dataURL);
      }
    };
    img.onerror = () => reject(new Error("เบราว์เซอร์ไม่รองรับชนิดไฟล์รูปนี้"));
    img.src = dataURL;
  });
}

// ประมวลผลไฟล์ 1 รูป: อ่านไฟล์ → ย่อถ้าจำเป็น → คืนค่าให้พร้อมเก็บลง slipFiles
// ถ้าย่อไม่สำเร็จ (แต่ FileReader อ่านไฟล์ดิบได้) จะใช้รูปต้นฉบับแทนแทนที่จะทิ้งไป
async function processSlipFile(file) {
  const rawDataURL = await readFileAsDataURL(file);
  try {
    const finalDataURL = await downscaleImage(rawDataURL);
    return { dataURL: finalDataURL, blob: file };
  } catch (e) {
    return { dataURL: rawDataURL, blob: file };
  }
}

document.getElementById("slipInput").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;
  // เคลียร์ค่า input ทันที เพื่อให้เลือกไฟล์เดิมซ้ำได้อีกครั้งถ้าต้องการ
  document.getElementById("slipInput").value = "";

  // ประมวลผลทีละไฟล์แบบแยกจากกัน — รูปไหนเสร็จก่อนขึ้นก่อนทันที และถ้ารูปไหน
  // อ่านไม่สำเร็จ จะไม่ทำให้รูปอื่นที่เลือกมาพร้อมกันหายไปด้วย เหมือนโค้ดเดิม
  let failCount = 0;
  for (const file of files) {
    try {
      const result = await processSlipFile(file);
      const entry = { ...result, slipCheck: CONFIG.SLIPOK_VERIFY_URL ? { status: "checking", message: "" } : null };
      slipFiles.push(entry);
      renderSlipPreview();
      if (CONFIG.SLIPOK_VERIFY_URL) checkSlipEntry(entry); // ไม่ต้อง await เพื่อไม่บล็อกรูปถัดไป
    } catch (err) {
      failCount += 1;
    }
  }
  if (failCount > 0) {
    showToast(`แนบไม่สำเร็จ ${failCount} รูป (ไฟล์อาจเสียหายหรือเบราว์เซอร์ไม่รองรับชนิดไฟล์นี้)`);
  }
});

// ตรวจสลิป 1 รูปกับ SlipOK แล้วอัปเดตสถานะของรูปนั้นในตัวอาร์เรย์ slipFiles โดยตรง
// (ใช้ reference ของ object เป็นตัวอ้างอิง เผื่อระหว่างรอผลลูกค้าลบ/เพิ่มรูปอื่น)
async function checkSlipEntry(entry) {
  const check = await verifySlipWithSlipOK(entry.dataURL, cartTotal());
  entry.slipCheck = check;
  renderSlipPreview();
  if (check.status === "warn") {
    showToast(`⚠️ สลิปที่แนบ: ${check.message}`);
  }
}

// คืนค่า { orderId } เมื่อส่งสำเร็จ (orderId อาจเป็น null ถ้าฝั่งเซิร์ฟเวอร์บันทึก
// Firestore ไม่สำเร็จ) และคืน null เมื่อส่งไม่สำเร็จ
async function submitOrderToShop(message, summary) {
  if (!CONFIG.ORDER_SUBMIT_URL) return null;
  try {
    // ถ้าลูกค้าล็อกอินอยู่ แนบ ID token ไปด้วย เพื่อให้ออเดอร์ผูกกับบัญชี
    // และเปิดดูสถานะจากอุปกรณ์อื่นได้
    let idToken = null;
    try {
      if (typeof mfAuth !== "undefined" && mfAuth.currentUser) idToken = await mfAuth.currentUser.getIdToken();
    } catch (e) {}
    const response = await fetch(CONFIG.ORDER_SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, summary, idToken, slips: slipFiles.map((file) => file.dataURL) }),
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => ({}));
    return { orderId: data.orderId || null };
  } catch (error) {
    console.error("ส่งออเดอร์เข้าร้านไม่สำเร็จ", error);
    return null;
  }
}

/* ============================================================
   SUBMIT ORDER → บันทึกออเดอร์ลงประวัติการสั่งซื้อในเว็บไซต์ (ไม่เด้งเข้า LINE)
   ============================================================ */
document.getElementById("submitOrder").addEventListener("click", async () => {
  if (cartCount() === 0) {
    showToast("กรุณาเลือกช่อดอกไม้ก่อนสั่งซื้อนะคะ 🌸");
    return;
  }

  const f = (id) => document.getElementById(id).value.trim();
  const ordererFirst = f("ordererFirst"), ordererLast = f("ordererLast"), ordererNick = f("ordererNick"), ordererPhone = f("ordererPhone");
  const recipientFirst = f("recipientFirst"), recipientLast = f("recipientLast"), recipientNick = f("recipientNick"), recipientPhone = f("recipientPhone");
  const address = f("custAddress"), date = f("custDate"), time = f("custTime"), note = f("custNote");
  const isPickup = deliveryState.fulfillmentMode === "pickup";

  if (!ordererFirst || !ordererPhone) {
    showToast("กรุณากรอกชื่อและเบอร์โทรผู้สั่งซื้อ");
    return;
  }
  if (!recipientFirst || (!isPickup && !address) || !date || !time) {
    showToast(`กรุณากรอกชื่อผู้รับ${isPickup ? "" : "และที่อยู่จัดส่ง"} วันที่ และเวลาที่ต้องการรับดอกไม้ให้ครบ`);
    return;
  }
  const [hour, minute] = time.split(":").map(Number);
  const deliveryMinutes = hour * 60 + minute;
  if (deliveryMinutes < 600 || deliveryMinutes > 1230) {
    showToast("กรุณาเลือกเวลาจัดส่งระหว่าง 10:00 ถึง 20:30 น.");
    return;
  }
  const deliveryBlock = getDeliveryBlockReason();
  if (deliveryBlock) {
    showToast(deliveryBlock);
    return;
  }
  if (slipFiles.length === 0) {
    showToast("กรุณาแนบรูปสลิปโอนเงินก่อนยืนยันสั่งซื้อ");
    return;
  }

  const lines = cart.map((l) => `• ${l.name}${l.note ? ` (${l.note})` : ""} x${l.qty} = ${(l.price * l.qty).toLocaleString()} บาท`);

  const message =
    `🌸 ออเดอร์ใหม่จาก ${CONFIG.SHOP_NAME} 🌸\n\n` +
    `${lines.join("\n")}\n\n` +
    `ค่าดอกไม้: ${cartSubtotal().toLocaleString()} บาท\n` +
    (isPickup
      ? `วิธีรับสินค้า: รับหน้าร้าน (${CONFIG.DELIVERY_ORIGIN.name})\nค่าจัดส่ง: ไม่มี\n`
      : `วิธีรับสินค้า: จัดส่ง\nค่าจัดส่ง (${deliveryState.km} กม. จาก${CONFIG.DELIVERY_ORIGIN.name}): ${deliveryFeeNow() === 0 ? "ฟรี" : deliveryFeeNow().toLocaleString() + " บาท"}\n`) +
    `ยอดรวม: ${cartTotal().toLocaleString()} บาท\n\n` +
    `— ผู้สั่งซื้อ —\n` +
    `ชื่อ: ${ordererFirst} ${ordererLast} (${ordererNick || "-"})\n` +
    `เบอร์โทร: ${ordererPhone}\n\n` +
    `— ผู้รับดอกไม้ —\n` +
    `ชื่อ: ${recipientFirst} ${recipientLast} (${recipientNick || "-"})\n` +
    `เบอร์โทร: ${recipientPhone || "-"}\n` +
    `ที่อยู่: ${isPickup ? `รับหน้าร้าน ${CONFIG.DELIVERY_ORIGIN.name}` : address}\n` +
    `พิกัด${isPickup ? "ร้าน" : "จัดส่ง"}${deliveryState.approx || deliveryState.estimated ? " (โดยประมาณ)" : ""}: https://www.google.com/maps?q=${deliveryState.lat},${deliveryState.lng}\n` +
    `วันที่ต้องการรับ: ${date}\n` +
    `เวลาที่ต้องการรับ: ${time} น.\n` +
    (note ? `หมายเหตุ/ข้อความในการ์ด: ${note}\n` : "") +
    `\n📎 แนบสลิปโอนเงิน ${slipFiles.length} รูป`;

  const orderSummary = {
    items: lines,
    fulfillmentType: isPickup ? "pickup" : "delivery",
    total: cartTotal(),
    subtotal: cartSubtotal(),
    deliveryKm: deliveryState.km,
    deliveryFee: deliveryFeeNow(),
    deliveryLat: deliveryState.lat,
    deliveryLng: deliveryState.lng,
    recipient: `${recipientFirst} ${recipientLast}`,
    deliveryDate: date,
    deliveryTime: `${time} น.`,
  };

  function finishOrder(successMessage, orderId) {
    saveOrderHistory({
      id: Date.now().toString().slice(-6),
      orderId: orderId || null,
      date: new Date().toLocaleString("th-TH"),
      createdAtMs: Date.now(),
      status: DEFAULT_ORDER_STATUS,
      statusReason: "",
      ...orderSummary,
    });
    showToast(successMessage);
    cart = [];
    saveCart();
    slipFiles = [];
    document.getElementById("slipInput").value = "";
    renderSlipPreview();
    drawer.classList.remove("open");
  }

  // ไม่เด้งเข้า LINE แล้ว — บันทึกออเดอร์ลงประวัติการสั่งซื้อบนเว็บไซต์เท่านั้น
  //  • ตั้ง CONFIG.ORDER_SUBMIT_URL ไว้: ส่งเข้าฐานข้อมูลของเว็บ (Firestore) ผ่าน
  //    Cloud Function แล้วเห็นประวัติ/สถานะได้ทุกเครื่องที่ล็อกอินบัญชีเดียวกัน
  //    (PC / MacBook / มือถือ) และเจ้าของร้านเห็นในหน้า admin
  //  • ยังไม่ตั้งค่า: บันทึกไว้ในเบราว์เซอร์เครื่องนี้ (localStorage) เท่านั้น
  const submitBtn = document.getElementById("submitOrder");
  if (submitBtn.disabled) return;
  submitBtn.disabled = true;
  try {
    if (CONFIG.ORDER_SUBMIT_URL) {
      const sent = await submitOrderToShop(message, orderSummary);
      if (!sent) {
        // ไม่ล้างตะกร้า/สลิป เพื่อให้ลูกค้ากดยืนยันซ้ำได้
        showToast("บันทึกออเดอร์ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วกดยืนยันอีกครั้ง");
        return;
      }
      finishOrder("บันทึกออเดอร์เรียบร้อยแล้ว ดูได้ที่ \"ประวัติการสั่งซื้อ\" 🌸", sent.orderId);
    } else {
      finishOrder("บันทึกออเดอร์ในประวัติการสั่งซื้อแล้ว 🌸");
    }
  } finally {
    submitBtn.disabled = false;
  }
});

/* ============================================================
   RENDER: PAYMENT INFO (บัญชีธนาคาร / QR พร้อมเพย์ของร้าน)
   ============================================================ */
function renderPaymentInfo() {
  const el = document.getElementById("paymentInfo");
  el.innerHTML = `
    <div class="payment-info__row">
      <span class="payment-info__bank">🏦 ${CONFIG.BANK_NAME}</span>
    </div>
    <div class="payment-info__row">
      <span class="payment-info__label">ชื่อบัญชี</span>
      <span>${CONFIG.BANK_ACCOUNT_NAME}</span>
    </div>
    <div class="payment-info__row payment-info__row--number">
      <span class="payment-info__label">เลขบัญชี</span>
      <span class="payment-info__number" id="bankAccountNumber">${CONFIG.BANK_ACCOUNT_NUMBER}</span>
      <button type="button" class="payment-info__copy" id="copyBankNumber">คัดลอก</button>
    </div>
    ${CONFIG.BANK_QR_IMAGE ? `<img class="payment-info__qr" src="${CONFIG.BANK_QR_IMAGE}" alt="QR พร้อมเพย์ ${CONFIG.SHOP_NAME}">` : ""}
  `;

  document.getElementById("copyBankNumber").addEventListener("click", async () => {
    const digitsOnly = CONFIG.BANK_ACCOUNT_NUMBER.replace(/[^0-9]/g, "");
    try {
      await navigator.clipboard.writeText(digitsOnly);
      showToast("คัดลอกเลขบัญชีแล้ว 📋");
    } catch (e) {
      showToast("คัดลอกไม่สำเร็จ ลองกดเลือกเลขบัญชีแล้วคัดลอกเองนะคะ");
    }
  });
}

/* ============================================================
   RENDER: HERO MEDIA / GALLERY
   ============================================================ */
function renderHeroMedia() {
  const wrap = document.getElementById("heroMedia");
  if (CONFIG.SHOWCASE_VIDEO) {
    const videoType = CONFIG.SHOWCASE_VIDEO.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4";
    wrap.innerHTML = `
      <video class="hero__video petal-cut" autoplay muted loop playsinline preload="auto"${CONFIG.HERO_IMAGE ? ` poster="${CONFIG.HERO_IMAGE}"` : ""}>
        <source src="${CONFIG.SHOWCASE_VIDEO}" type="${videoType}">
      </video>`;

    const video = wrap.querySelector("video");
    video.addEventListener("error", () => {
      if (CONFIG.HERO_IMAGE) {
        wrap.innerHTML = `<img class="hero__photo petal-cut" src="${CONFIG.HERO_IMAGE}" alt="${CONFIG.SHOP_NAME}">`;
      }
    }, { once: true });
    video.play().catch(() => {});
  } else if (CONFIG.HERO_IMAGE) {
    wrap.innerHTML = `<img class="hero__photo petal-cut" src="${CONFIG.HERO_IMAGE}" alt="${CONFIG.SHOP_NAME}">`;
  }
}

function renderGallery() {
  if (!GALLERY_IMAGES.length) return;
  document.getElementById("gallery").style.display = "";
  document.getElementById("galleryGrid").innerHTML = GALLERY_IMAGES.map(
    (src) => `<div class="gallery__item"><img src="${src}" alt="${CONFIG.SHOP_NAME}" loading="lazy"></div>`
  ).join("");
}

/* ============================================================
   INIT
   ============================================================ */
renderProducts();
renderCart();
renderCartCount();
renderHeroMedia();
renderGallery();
renderPaymentInfo();
renderOrderHistory();
refreshOrderStatuses();

const dateInput = document.getElementById("custDate");
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
dateInput.min = tomorrow.toISOString().split("T")[0];

// ตั้งเวลาเริ่มต้นเป็น 10:00 น. เพื่อความสะดวก (ลูกค้าแก้ไขได้)
const timeInput = document.getElementById("custTime");
if (timeInput) {
  timeInput.min = "10:00";
  timeInput.max = "20:30";
  timeInput.step = "1800";
  if (!timeInput.value) timeInput.value = "10:00";
}
