import { apiRequest } from "./api/http.js";
const form = document.getElementById("reset-password-form");
const submitBtn = document.getElementById("reset-submit-btn");

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (!token) {
  showWarning("رابط إعادة تعيين كلمة السر غير صالح أو ناقص.");
  window.location.href = "forgot-password.html";
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  const password = String(formData.get("password") || "").trim();
  const confirmPassword = String(formData.get("confirmPassword") || "").trim();

  if (!password || !confirmPassword) {
    showWarning("يرجى إدخال كلمة السر وتأكيدها.");
    return;
  }

  if (password.length < 6) {
    showWarning("كلمة السر يجب أن تكون 6 أحرف على الأقل.");
    return;
  }

  if (password !== confirmPassword) {
    showWarning("كلمة السر وتأكيدها غير متطابقين.");
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "جاري الحفظ...";

    const response = await apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token,
        password,
      }),
    });

    showSuccess(response.message || "تم تغيير كلمة السر بنجاح. سيتم تحويلك إلى تسجيل الدخول.");

    window.setTimeout(() => {
      window.location.href = "login.html";
    }, 1400);
  } catch (error) {
    console.error(error);
    showError(error.message || "فشل تغيير كلمة السر.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "حفظ كلمة السر الجديدة";
  }
});
