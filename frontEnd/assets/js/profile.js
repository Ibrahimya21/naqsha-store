import { getCurrentUser, apiRequest } from "./api/http.js";

const showSuccess = window.showSuccess || ((message) => alert(message));
const showError = window.showError || ((message) => alert(message));
const showWarning = window.showWarning || ((message) => alert(message));

const user = getCurrentUser();

if (!user) {
  window.location.href = "login.html";
} else {
  fillPasswordPage(user);
  bindLogoutFallback();
  bindChangePassword();
}

function fillPasswordPage(currentUser) {
  const userName =
    currentUser?.full_name ||
    currentUser?.name ||
    currentUser?.username ||
    "مستخدم";

  const userEmail = currentUser?.email || "—";

  setText("profileAvatar", userName.trim().slice(0, 2) || "؟");
  setText("profileNameTitle", `مرحبًا ${userName}`);
  setText("profileEmailTitle", userEmail);
}

function bindLogoutFallback() {
  document.getElementById("profileLogoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("naqsha.user");
    localStorage.removeItem("naqsha_user");

    window.location.href = "login.html";
  });
}

function bindChangePassword() {
  const form = document.getElementById("profilePasswordForm");
  const btn = document.getElementById("changePasswordBtn");

  if (!form || !btn) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const currentPassword = document
      .getElementById("current-password")
      ?.value.trim();

    const newPassword = document.getElementById("new-password")?.value.trim();

    const confirmPassword = document
      .getElementById("confirm-password")
      ?.value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showWarning("جميع حقول كلمة السر مطلوبة");
      return;
    }

    if (newPassword.length < 6) {
      showWarning("كلمة السر الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (newPassword !== confirmPassword) {
      showWarning("كلمة السر الجديدة وتأكيدها غير متطابقين");
      return;
    }

    try {
      btn.disabled = true;
      btn.textContent = "جاري التغيير...";

      await apiRequest("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      form.reset();
      showSuccess("تم تغيير كلمة السر بنجاح");
    } catch (error) {
      showError(error.message || "فشل تغيير كلمة السر");
    } finally {
      btn.disabled = false;
      btn.textContent = "تغيير كلمة السر";
    }
  });
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value ?? "";
}
