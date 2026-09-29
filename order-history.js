function orderHistoryKey() {
  const userId = typeof mfAuth !== "undefined" && mfAuth.currentUser ? mfAuth.currentUser.uid : "guest";
  return `mf_order_history_${userId}`;
}

function saveOrderHistory(order) {
  const key = orderHistoryKey();
  let history = [];
  try { history = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) {}
  history.unshift(order);
  localStorage.setItem(key, JSON.stringify(history.slice(0, 20)));
  renderOrderHistory();
}

/* ---------- สถานะออเดอร์: เก็บรายการที่ลูกค้าลบไว้ ไม่ให้ดึงกลับมาจากเซิร์ฟเวอร์ ---------- */
function hiddenOrdersKey() { return orderHistoryKey().replace("mf_order_history_", "mf_order_hidden_"); }
function getHiddenOrders() {
  try { return JSON.parse(localStorage.getItem(hiddenOrdersKey()) || "[]"); } catch (e) { return []; }
}
function hideOrders(orderIds) {
  const ids = orderIds.filter(Boolean);
  if (!ids.length) return;
  localStorage.setItem(hiddenOrdersKey(), JSON.stringify([...new Set([...getHiddenOrders(), ...ids])].slice(-200)));
}

function renderOrderHistory() {
  const wrap = document.getElementById("orderHistoryList");
  if (!wrap) return;
  let history = [];
  try { history = JSON.parse(localStorage.getItem(orderHistoryKey()) || "[]"); } catch (e) {}
  if (!history.length) {
    wrap.innerHTML = '<p class="order-history__empty">ยังไม่มีประวัติการสั่งซื้อ</p>';
    return;
  }
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>\'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[char]);
  wrap.innerHTML = history.map((order) => {
    const st = orderStatusInfo(order.status);
    const reason = order.status === "cancelled"
      ? `<div class="order-history__reason">เหตุผลที่ยกเลิก: ${escapeHtml(order.statusReason || "ไม่ได้ระบุ")}</div>` : "";
    return `
    <article class="order-history__item">
      <div class="order-history__head">
        <span class="order-history__id">ออเดอร์ ${escapeHtml(order.id)}</span>
        <span class="order-history__date">${escapeHtml(order.date)}</span>
      </div>
      <div class="order-history__status"><span class="status-badge status--${escapeHtml(st.key)}">${st.icon} ${escapeHtml(st.label)}</span></div>
      ${reason}
      <div class="order-history__items">${(order.items || []).map(escapeHtml).join("<br>")}</div>
      <div class="order-history__customer">ผู้รับ: ${escapeHtml(order.recipient)} · ${escapeHtml(order.deliveryDate)} ${escapeHtml(order.deliveryTime)}</div>
      <div class="order-history__total">ยอดรวม ${Number(order.total).toLocaleString()} บาท</div>
      <button type="button" class="order-history__delete" data-order-id="${escapeHtml(order.id)}">ลบรายการนี้</button>
    </article>`;
  }).join("");
  wrap.querySelectorAll("[data-order-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = orderHistoryKey();
      let current = [];
      try { current = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) {}
      hideOrders(current.filter((order) => String(order.id) === button.dataset.orderId).map((order) => order.orderId));
      localStorage.setItem(key, JSON.stringify(current.filter((order) => String(order.id) !== button.dataset.orderId)));
      renderOrderHistory();
    });
  });
}

/* ---------- ดึงสถานะออเดอร์ล่าสุดจากร้าน ---------- */
let statusRefreshBusy = false;
async function refreshOrderStatuses() {
  if (!CONFIG.ORDER_STATUS_URL || statusRefreshBusy) return;
  const key = orderHistoryKey();
  let history = [];
  try { history = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) {}
  const loggedIn = typeof mfAuth !== "undefined" && !!mfAuth.currentUser;
  const ids = history.map((o) => o.orderId).filter(Boolean);
  if (!ids.length && !loggedIn) return;

  statusRefreshBusy = true;
  try {
    let idToken = null;
    if (loggedIn) { try { idToken = await mfAuth.currentUser.getIdToken(); } catch (e) {} }
    const res = await fetch(CONFIG.ORDER_STATUS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, idToken }),
    });
    if (!res.ok) return;
    const { orders = [] } = await res.json();
    if (orderHistoryKey() !== key) return;

    const hidden = new Set(getHiddenOrders());
    const byOrderId = new Map(history.filter((o) => o.orderId).map((o) => [o.orderId, o]));
    orders.forEach((srv) => {
      if (hidden.has(srv.id)) return;
      const local = byOrderId.get(srv.id);
      if (local) {
        local.status = srv.status;
        local.statusReason = srv.statusReason || "";
        if (!local.createdAtMs && srv.createdAtMs) local.createdAtMs = srv.createdAtMs;
      } else if (srv.summary) {
        history.push({
          id: srv.id.slice(0, 6).toUpperCase(),
          orderId: srv.id,
          date: srv.createdAtMs ? new Date(srv.createdAtMs).toLocaleString("th-TH") : "",
          createdAtMs: srv.createdAtMs || 0,
          status: srv.status,
          statusReason: srv.statusReason || "",
          ...srv.summary,
        });
      }
    });
    history.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
    localStorage.setItem(key, JSON.stringify(history.slice(0, 20)));
    renderOrderHistory();
  } catch (err) {
    console.error("ดึงสถานะออเดอร์ไม่สำเร็จ", err);
  } finally {
    statusRefreshBusy = false;
  }
}

setInterval(() => { if (document.visibilityState === "visible") refreshOrderStatuses(); }, 30000);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") refreshOrderStatuses(); });

document.getElementById("clearOrderHistory")?.addEventListener("click", () => {
  if (!confirm("ลบประวัติการสั่งซื้อทั้งหมดของบัญชีนี้ใช่ไหม?")) return;
  let current = [];
  try { current = JSON.parse(localStorage.getItem(orderHistoryKey()) || "[]"); } catch (e) {}
  hideOrders(current.map((order) => order.orderId));
  localStorage.removeItem(orderHistoryKey());
  renderOrderHistory();
});

renderOrderHistory();
refreshOrderStatuses();
