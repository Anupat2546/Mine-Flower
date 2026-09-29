/* ============================================================
  MINE FLOWERS — เข้าสู่ระบบด้วย Google
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
document.getElementById("authLogoutBtn").addEventListener("click", logoutUser);
