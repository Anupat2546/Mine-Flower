/* ============================================================
   MINE FLOWERS — เข้าสู่ระบบด้วย Google / Facebook / LINE
   ใช้ Firebase Authentication เป็นตัวกลาง (ฟรี) เพราะเว็บนี้เป็น
   static site ไม่มี server ของตัวเองที่จะเก็บบัญชีผู้ใช้ได้อย่างปลอดภัย

   ⚠️ ต้องตั้งค่า 3 ก้อนข้างล่างนี้ให้เป็นของร้านคุณก่อนใช้งานจริง
   (ดูวิธีหาค่าเหล่านี้ได้จากขั้นตอนที่แนะนำไว้ในแชท)
   ============================================================ */

// 👉 จาก Firebase Console > Project settings > General > Your apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKIEgLm9NropDTxYA-noeuqDEZtynZ_8E",
  authDomain: "mine-flower.firebaseapp.com",
  projectId: "mine-flower",
  storageBucket: "mine-flower.firebasestorage.app",
  messagingSenderId: "210230198491",
  appId: "1:210230198491:web:2ebd8c992af4d1eef30cfe",
};

// 👉 จาก LINE Developers Console > ช่อง LINE Login ที่สร้างไว้
const LINE_LOGIN = {
  CHANNEL_ID: "YOUR_LINE_LOGIN_CHANNEL_ID",
  // ต้องตรงกับ Callback URL ที่ตั้งไว้ใน LINE Developers Console แบบเป๊ะๆ ทุกตัวอักษร
  REDIRECT_URI: window.location.origin + window.location.pathname,
  // URL ของ Cloud Function "lineLogin" หลัง deploy แล้ว (ดูไฟล์ functions/index.js)
  TOKEN_EXCHANGE_URL: "https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/lineLogin",
};

firebase.initializeApp(firebaseConfig);
const mfAuth = firebase.auth();

/* ---------- Google ---------- */
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  mfAuth.signInWithPopup(provider).catch((err) => {
    console.error(err);
    showToast("เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
  });
}

/* ---------- Facebook ---------- */
function loginWithFacebook() {
  const provider = new firebase.auth.FacebookAuthProvider();
  mfAuth.signInWithPopup(provider).catch((err) => {
    console.error(err);
    showToast("เข้าสู่ระบบด้วย Facebook ไม่สำเร็จ");
  });
}

/* ---------- LINE ----------
   Firebase ไม่มีตัวเชื่อม LINE ให้ในตัว ต้องพาลูกค้าไปหน้ายืนยันตัวตน
   ของ LINE เอง แล้วให้ Cloud Function (ฝั่งเซิร์ฟเวอร์) แลก "code" ที่ได้
   กลับมาเป็น Firebase custom token อีกที เพื่อไม่ให้ LINE Channel Secret
   หลุดไปอยู่ในโค้ดหน้าเว็บที่ใครก็เปิดดูได้ */
function loginWithLine() {
  const state = Math.random().toString(36).slice(2);
  sessionStorage.setItem("mf_line_state", state);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINE_LOGIN.CHANNEL_ID,
    redirect_uri: LINE_LOGIN.REDIRECT_URI,
    state: state,
    scope: "profile openid",
  });
  window.location.href = "https://access.line.me/oauth2/v2.1/authorize?" + params.toString();
}

// เช็คทุกครั้งที่โหลดหน้าเว็บว่า LINE เพิ่ง redirect กลับมาพร้อม ?code=... หรือเปล่า
async function handleLineRedirectIfAny() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code) return;

  const savedState = sessionStorage.getItem("mf_line_state");
  sessionStorage.removeItem("mf_line_state");
  window.history.replaceState({}, document.title, window.location.pathname); // ล้าง ?code=... ออกจาก URL

  if (!state || state !== savedState) {
    showToast("เข้าสู่ระบบด้วย LINE ไม่สำเร็จ กรุณาลองใหม่");
    return;
  }

  try {
    const res = await fetch(LINE_LOGIN.TOKEN_EXCHANGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code, redirectUri: LINE_LOGIN.REDIRECT_URI }),
    });
    const data = await res.json();
    if (!data.token) throw new Error(data.error || "ไม่ได้รับ token กลับมาจากระบบ");
    await mfAuth.signInWithCustomToken(data.token);
    showToast("เข้าสู่ระบบด้วย LINE สำเร็จ 🌸");
  } catch (err) {
    console.error(err);
    showToast("เข้าสู่ระบบด้วย LINE ไม่สำเร็จ");
  }
}

/* ---------- ออกจากระบบ ---------- */
function logoutUser() {
  mfAuth.signOut();
}

/* ---------- อัปเดตหน้าตา navbar ตามสถานะล็อกอิน ---------- */
function updateAuthUI(user) {
  const loginBtn = document.getElementById("authLoginBtn");
  const userChip = document.getElementById("authUserChip");
  const userName = document.getElementById("authUserName");

  if (user) {
    loginBtn.style.display = "none";
    userChip.style.display = "flex";
    userName.textContent = user.displayName || "ลูกค้า";
    document.getElementById("loginDrawer").classList.remove("open");
  } else {
    loginBtn.style.display = "";
    userChip.style.display = "none";
  }
  if (typeof renderOrderHistory === "function") renderOrderHistory();
  if (typeof refreshOrderStatuses === "function") refreshOrderStatuses();
}

mfAuth.onAuthStateChanged(updateAuthUI);

document.getElementById("authLoginBtn").addEventListener("click", () => {
  document.getElementById("loginDrawer").classList.add("open");
});
document.getElementById("loginDrawerClose").addEventListener("click", () => {
  document.getElementById("loginDrawer").classList.remove("open");
});
document.getElementById("loginDrawerBackdrop").addEventListener("click", () => {
  document.getElementById("loginDrawer").classList.remove("open");
});
document.getElementById("loginGoogleBtn").addEventListener("click", loginWithGoogle);
document.getElementById("loginFacebookBtn").addEventListener("click", loginWithFacebook);
document.getElementById("loginLineBtn").addEventListener("click", loginWithLine);
document.getElementById("authLogoutBtn").addEventListener("click", logoutUser);

handleLineRedirectIfAny();
