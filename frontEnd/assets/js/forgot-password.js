import { apiRequest } from "./api/http.js";


const form = document.getElementById("forgot-password-form");
const submitBtn = document.getElementById("forgot-submit-btn");

const formHeader = document.getElementById("forgotFormHeader");
const successBox = document.getElementById("forgotSuccessBox");
const successEmail = document.getElementById("forgotSuccessEmail");
const backLogin = document.getElementById("forgotBackLogin");
const signupLink = document.getElementById("forgotSignupLink");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();

  if (!email) {
    showWarning("يرجى إدخال البريد الإلكتروني");
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "جاري الإرسال...";

    await apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    showSuccessState(email);
  } catch (error) {
    console.error(error);
    showError(error.message || "تعذر إرسال طلب استعادة كلمة السر");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "إرسال رابط الاستعادة";
  }
});

function showSuccessState(email) {
  formHeader?.classList.add("d-none");
  form?.classList.add("d-none");
  backLogin?.classList.add("d-none");
  signupLink?.classList.add("d-none");

  if (successEmail) {
    successEmail.textContent = email;
  }

  successBox?.classList.remove("d-none");
}
