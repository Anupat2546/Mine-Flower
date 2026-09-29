/* ============================================================
   MINE FLOWERS — CONFIG & INVENTORY (ใช้ร่วมกันทั้งหน้าร้านและหน้า admin)
   แก้ไขค่าตรงนี้ให้เป็นของร้านคุณก่อนใช้งานจริง
   ============================================================ */
const CONFIG = {
  // LINE Official Account ID ของร้าน (เช่น "@mineflowerz")
  // หาได้จาก LINE Official Account Manager > การตั้งค่า > Basic ID
  LINE_OA_ID: "@998hgsvg",

  // ชื่อร้าน แสดงในสรุปออเดอร์
  SHOP_NAME: "Mine Flowers",

  // รูปพื้นหลัง Hero — ใส่ path รูปจริงของร้าน เช่น "images/hero.jpg"
  HERO_IMAGE: "",

  // วิดีโอแนะนำร้าน (ถ้าใส่ทั้งรูปและวิดีโอ รูปจะเป็นภาพเริ่มต้น/ภาพสำรอง)
  SHOWCASE_VIDEO: "",

  // ราคาเริ่มต้นของช่อ "ออกแบบเอง" ก่อนบวกส่วนเพิ่มจากดอก/สี/ห่อ/โบว์ที่เลือก
  CUSTOM_BASE_PRICE: 450,

  // รหัสผ่านสำหรับหน้าตั้งค่าของเจ้าของร้าน (admin.html) — แก้เป็นของคุณเอง!
  ADMIN_PASSWORD: "##Cake2546##",

  // ============ ข้อมูลบัญชีธนาคารสำหรับรับชำระเงิน ============
  // แก้ให้เป็นบัญชีจริงของร้านก่อนใช้งาน — จะแสดงในหน้าตะกร้าให้ลูกค้าโอนเงิน
  BANK_NAME: "ธนาคารไทยพาณิชย์",           // 👈 ชื่อธนาคาร
  BANK_ACCOUNT_NAME: "นายอนุภัทร ลภัสเตชนนท์", // 👈 ชื่อบัญชี
  BANK_ACCOUNT_NUMBER: "385-2-51042-9",    // 👈 เลขบัญชี

  // (ไม่บังคับ) รูป QR พร้อมเพย์ของร้าน — ถ้าใส่ path ไว้ จะโชว์ให้สแกนจ่ายได้เลย
  // เอาไฟล์ไปวางในโฟลเดอร์ images/ แล้วใส่ path เช่น "images/promptpay-qr.png"
  BANK_QR_IMAGE: "image/products/QR CODE.jpg",

  // ============ ตรวจสลิปโอนเงินอัตโนมัติด้วย SlipOK ============
  // URL ของ Cloud Function "verifySlip" หลัง deploy แล้ว (ดูไฟล์ functions/index.js)
  // ถ้าปล่อยว่างไว้ ระบบจะข้ามการตรวจสลิปอัตโนมัติไปเฉยๆ (ลูกค้าแนบสลิปได้ตามปกติ
  // แค่ไม่มีการเช็คยอด/บัญชีให้อัตโนมัติ)
  SLIPOK_VERIFY_URL: "",

  // URL ของ Cloud Function submitOrder สำหรับส่งข้อมูลและสลิปเข้าร้านอัตโนมัติ
  // ถ้ายังว่าง ระบบจะใช้การแชร์/คัดลอกเป็นวิธีสำรอง
  ORDER_SUBMIT_URL: "",

  // URL ของ Cloud Function "orderStatus" หลัง deploy แล้ว (ดูไฟล์ functions/index.js)
  // ใช้ให้หน้าประวัติออเดอร์ของลูกค้าดึงสถานะล่าสุดที่เจ้าของร้านอัปเดตไว้
  // ถ้าปล่อยว่าง ลูกค้าจะเห็นแค่สถานะเริ่มต้น (ไม่อัปเดตตามที่ร้านแก้)
  ORDER_STATUS_URL: "",

  // ============ ค่าจัดส่ง / จำกัดระยะทาง (ดูไฟล์ delivery.js) ============
  // จุดเริ่มต้นการส่ง — พิกัดโดยประมาณของตลาดไท (ตลาดดอกไม้) ให้ตรวจ/แก้ให้ตรงจุดรับดอกไม้จริง:
  // เปิด Google Maps > คลิกขวาที่จุดนั้น > คลิกตัวเลขพิกัดเพื่อคัดลอก (ตัวแรก = lat, ตัวหลัง = lng)
  DELIVERY_ORIGIN: { name: "ตลาดไท", lat: 13.9545, lng: 100.6285 },
  DELIVERY_MAX_KM: 20,   // ส่งไกลสุดกี่ กม. (ระยะทางถนน)
  DELIVERY_FREE_KM: 10,  // ไม่เกินกี่ กม. ส่งฟรี
  DELIVERY_FEE: 50,      // ค่าส่ง (บาท) เมื่อเกิน DELIVERY_FREE_KM แต่ไม่เกิน DELIVERY_MAX_KM
  ROAD_FACTOR: 1.3,      // ตัวคูณประมาณระยะถนนจากเส้นตรง (ใช้เฉพาะตอนระบบเส้นทางล่ม)
};

/* ============================================================
   สถานะออเดอร์ (ใช้ร่วมกันทั้งหน้าร้านและหน้า admin ทุกอุปกรณ์)
   key = ค่าที่เก็บใน Firestore, label = ข้อความที่แสดง — แก้ label ได้ตามต้องการ
   ลำดับในลิสต์นี้ = ลำดับที่แสดงในเมนูเลือกสถานะของ admin
   ============================================================ */
const ORDER_STATUSES = [
  { key: "pending",    label: "ยังไม่ได้สั่ง",       icon: "🕐" },
  { key: "ordered",    label: "สั่งไปแล้ว",          icon: "✅" },
  { key: "delivering", label: "กำลังไปส่งออเดอร์",   icon: "🚚" },
  { key: "delivered",  label: "ออเดอร์ส่งเสร็จแล้ว", icon: "🎉" },
  { key: "cancelled",  label: "ยกเลิกออเดอร์",       icon: "❌" },
];
const DEFAULT_ORDER_STATUS = "pending";

function orderStatusInfo(key) {
  return ORDER_STATUSES.find((s) => s.key === key) || ORDER_STATUSES[0];
}

/* ============================================================
   คลังสินค้าเริ่มต้น (ค่าเริ่มต้น ใช้ครั้งแรกที่ยังไม่เคยตั้งค่าในหน้า admin)
   เจ้าของร้านแก้ไข "หมด/เหลือกี่ชิ้น" ได้จริงผ่านหน้า admin.html โดยไม่ต้องแก้โค้ด
   ข้อมูลจะถูกบันทึกไว้ในเบราว์เซอร์ (localStorage)

   ⚠️ ข้อจำกัดสำคัญ: เว็บนี้เป็น static site ไม่มีฐานข้อมูลกลาง
   ค่าที่ตั้งในหน้า admin จะ "เห็นเฉพาะเบราว์เซอร์/เครื่องเดียวกัน" เท่านั้น
   ถ้าเปิด admin.html จากมือถือร้าน แต่ลูกค้าเข้าเว็บจากเครื่องอื่น
   สต็อกจะไม่ซิงก์กันอัตโนมัติ — ต้องต่อฐานข้อมูลออนไลน์ (เช่น Firebase
   Firestore ฟรี) ถึงจะซิงก์ข้ามอุปกรณ์แบบเรียลไทม์ได้ แจ้งได้ถ้าต้องการอัปเกรด
   ============================================================ */
const DEFAULT_INVENTORY = {
  flowerTypes: [
    { id: "rose", name: "กุหลาบ", stock: 50, active: true, priceAdd: 0 },
    { id: "tulip", name: "ทิวลิป", stock: 50, active: false, priceAdd: 0 },
    { id: "lily", name: "ลิลลี่", stock: 50, active: false, priceAdd: 0 },
    { id: "sunflower", name: "ทานตะวัน", stock: 50, active: true, priceAdd: 0 },
    { id: "gerbera", name: "เยอบีร่า", stock: 50, active: true, priceAdd: 0 },
    { id: "babybreath", name: "ยิปโซ", stock: 50, active: false, priceAdd: 0 },
  ],
  flowerColors: [
    { id: "pink", name: "ชมพู", hex: "#E8A9BB", stock: 50, active: true, priceAdd: 0 },
    { id: "red", name: "แดง", hex: "#C1394B", stock: 50, active: true, priceAdd: 0 },
    { id: "white", name: "ขาว", hex: "#FFFFFF", stock: 50, active: true, priceAdd: 0 },
    { id: "yellow", name: "เหลือง", hex: "#F2C14E", stock: 50, active: true, priceAdd: 0 },
    { id: "purple", name: "ม่วง", hex: "#B497D6", stock: 50, active: true, priceAdd: 0 },
  ],
  wraps: [
    { id: "kraft", name: "กระดาษคราฟท์", hex: "#C9A76B", stock: 50, active: true, priceAdd: 0 },
    { id: "white-wrap", name: "กระดาษขาว", hex: "#FFFFFF", stock: 50, active: true, priceAdd: 0 },
    { id: "pink-wrap", name: "กระดาษชมพูพาสเทล", hex: "#F4CBD6", stock: 50, active: true, priceAdd: 0 },
    { id: "clear-wrap", name: "พลาสติกใส", hex: "#EAF3EA", stock: 50, active: true, priceAdd: 0 },
  ],
  bows: [
    { id: "satin-pink", name: "โบว์ผ้าซาตินชมพู", hex: "#E8A9BB", stock: 50, active: true, priceAdd: 0 },
    { id: "satin-red", name: "โบว์ผ้าซาตินแดง", hex: "#C1394B", stock: 50, active: true, priceAdd: 0 },
    { id: "jute", name: "เชือกปอธรรมชาติ", hex: "#B08D57", stock: 50, active: true, priceAdd: 0 },
    { id: "gold-ribbon", name: "ริบบิ้นทอง", hex: "#C9A76B", stock: 50, active: true, priceAdd: 0 },
  ],
};

const INVENTORY_KEY = "mf_inventory";

function loadInventory() {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
}

function saveInventory(inv) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv));
}
