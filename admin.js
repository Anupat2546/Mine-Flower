/* ============================================================
   MINE FLOWERS — ADMIN PANEL LOGIC
   ใช้ CONFIG / DEFAULT_INVENTORY / loadInventory / saveInventory
   จากไฟล์ inventory-config.js ที่โหลดไว้ก่อนหน้านี้แล้ว
   ============================================================ */

let inv = loadInventory();

/* ---------- LOGIN GATE ---------- */
const SESSION_KEY = "mf_admin_ok";

function showPanel() {
  document.getElementById("loginGate").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";
  renderAllTables();
}

function clearLocalOrderHistory() {
  const historyKeys = Object.keys(localStorage).filter((key) => key.startsWith("mf_order_history_"));
  if (!historyKeys.length) {
    showToast("ไม่พบประวัติออเดอร์ในเครื่องนี้");
    return;
  }
  if (!confirm(`ลบประวัติออเดอร์ ${historyKeys.length} ชุดในเครื่องนี้ใช่ไหม?`)) return;
  historyKeys.forEach((key) => localStorage.removeItem(key));
  showToast("ล้างประวัติออเดอร์ในเครื่องนี้แล้ว");
}

if (sessionStorage.getItem(SESSION_KEY) === "1") {
  showPanel();
}

document.getElementById("loginBtn").addEventListener("click", tryLogin);
document.getElementById("passwordInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") tryLogin();
});

function tryLogin() {
  const val = document.getElementById("passwordInput").value;
  if (val === CONFIG.ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, "1");
    showPanel();
  } else {
    showToast("รหัสผ่านไม่ถูกต้อง");
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
});
document.getElementById("clearOrderHistoryBtn").addEventListener("click", clearLocalOrderHistory);

/* ---------- TOAST ---------- */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ---------- RENDER TABLES ---------- */
const SECTION_LABELS = {
  flowerTypes: "ชนิดดอกไม้",
  flowerColors: "สีดอกไม้",
  wraps: "กระดาษ/ห่อช่อ",
  bows: "โบว์/ริบบิ้น",
};

const HAS_COLOR = { flowerTypes: false, flowerColors: true, wraps: true, bows: true };

function renderAllTables() {
  Object.keys(SECTION_LABELS).forEach(renderTable);
}

function renderTable(key) {
  const el = document.getElementById("table-" + key);
  const items = inv[key];

  el.innerHTML = `
    <div class="admin-row admin-row--head">
      <span>สถานะ</span>
      <span>ชื่อ</span>
      ${HAS_COLOR[key] ? "<span>สี</span>" : ""}
      <span>จำนวนคงเหลือ</span>
      <span>ราคาบวกเพิ่ม (บาท)</span>
      <span></span>
    </div>
  ` + items.map((it, idx) => `
    <div class="admin-row" data-key="${key}" data-idx="${idx}">
      <label class="admin-toggle">
        <input type="checkbox" class="f-active" ${it.active ? "checked" : ""}>
        <span>${it.active ? "เปิดขาย" : "ปิด/ซ่อน"}</span>
      </label>
      <input type="text" class="f-name" value="${it.name}">
      ${HAS_COLOR[key] ? `<input type="color" class="f-hex" value="${it.hex || "#E8A9BB"}">` : ""}
      <input type="number" class="f-stock" value="${it.stock}" min="0">
      <input type="number" class="f-price" value="${it.priceAdd || 0}" min="0">
      <button class="admin-del" title="ลบรายการนี้">ลบ</button>
    </div>
  `).join("");

  // bind events for this table
  el.querySelectorAll(".admin-row:not(.admin-row--head)").forEach((row) => {
    const key = row.dataset.key;
    const idx = Number(row.dataset.idx);

    row.querySelector(".f-active").addEventListener("change", (e) => {
      inv[key][idx].active = e.target.checked;
      renderTable(key);
    });
    row.querySelector(".f-name").addEventListener("input", (e) => {
      inv[key][idx].name = e.target.value;
    });
    const hexInput = row.querySelector(".f-hex");
    if (hexInput) hexInput.addEventListener("input", (e) => {
      inv[key][idx].hex = e.target.value;
    });
    row.querySelector(".f-stock").addEventListener("input", (e) => {
      inv[key][idx].stock = Math.max(0, Number(e.target.value) || 0);
    });
    row.querySelector(".f-price").addEventListener("input", (e) => {
      inv[key][idx].priceAdd = Math.max(0, Number(e.target.value) || 0);
    });
    row.querySelector(".admin-del").addEventListener("click", () => {
      if (confirm(`ลบ "${inv[key][idx].name}" ใช่ไหม?`)) {
        inv[key].splice(idx, 1);
        renderTable(key);
      }
    });
  });
}

/* ---------- ADD NEW ITEM ---------- */
document.querySelectorAll(".admin-add").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.addTo;
    const newItem = { id: key + "-" + Date.now(), name: "รายการใหม่", stock: 0, active: true, priceAdd: 0 };
    if (HAS_COLOR[key]) newItem.hex = "#E8A9BB";
    inv[key].push(newItem);
    renderTable(key);
  });
});

/* ---------- SAVE / RESET ---------- */
document.getElementById("saveBtn").addEventListener("click", () => {
  saveInventory(inv);
  showToast("บันทึกเรียบร้อย ✅ หน้าร้านจะอัปเดตสต็อกทันที (เบราว์เซอร์นี้)");
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("รีเซ็ตสต็อกทั้งหมดกลับเป็นค่าเริ่มต้นจากโค้ด? การเปลี่ยนแปลงที่ยังไม่บันทึกจะหายไป")) {
    inv = JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
    renderAllTables();
    showToast("รีเซ็ตแล้ว — อย่าลืมกด \"บันทึกการเปลี่ยนแปลง\"");
  }
});
