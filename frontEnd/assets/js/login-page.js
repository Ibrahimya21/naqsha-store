import { loginUser } from "./api/auth-api.js";

const form = document.getElementById("login-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      const response = await loginUser({ email, password });
      const user = response.data.user;

      if (user.role === "admin") {
        window.location.href = "index.html";
      } else {
        window.location.href = "index.html";
      }
    } catch (error) {
      showError(error.message);
    }
  });
}
