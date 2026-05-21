import { registerUser, logoutUser } from "./api/auth-api.js";
const form = document.getElementById("signup-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      full_name: form.full_name.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value.trim(),
      agree_to_terms: form.agree_to_terms.checked,
    };

    try {
      const response = await registerUser(payload);
      logoutUser();
      showSuccess(response.message || "تم إنشاء الحساب بنجاح. سيتم تحويلك إلى تسجيل الدخول.");
      window.setTimeout(() => {
        window.location.href = "login.html";
      }, 1400);
    } catch (error) {
      showError(error.message || "فشل في إنشاء الحساب.");
    }
  });
}
