(function () {
  const toastIcons = {
    success: "✓",
    error: "!",
    warning: "!",
    info: "i",
  };

  const toastTitles = {
    success: "تم بنجاح",
    error: "حدث خطأ",
    warning: "تنبيه",
    info: "معلومة",
  };

  function ensureToastContainer() {
    let container = document.querySelector(".toast-container");

    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-atomic", "true");
      document.body.appendChild(container);
    }

    return container;
  }

  function showToast(message, type = "info", options = {}) {
    const container = ensureToastContainer();

    const safeType = ["success", "error", "warning", "info"].includes(type)
      ? type
      : "info";

    const toast = document.createElement("div");
    toast.className = `toast-message toast-${safeType}`;

    const title = options.title || toastTitles[safeType];
    const duration = Number(options.duration || 3500);

    toast.innerHTML = `
      <div class="toast-icon">${toastIcons[safeType]}</div>

      <div class="toast-content">
        <p class="toast-title">${escapeHtml(title)}</p>
        <p class="toast-text">${escapeHtml(message)}</p>
      </div>

      <button class="toast-close" type="button" aria-label="إغلاق">×</button>
    `;

    container.appendChild(toast);

    const close = () => {
      toast.classList.add("is-hiding");

      window.setTimeout(() => {
        toast.remove();
      }, 220);
    };

    toast.querySelector(".toast-close")?.addEventListener("click", close);

    if (duration > 0) {
      window.setTimeout(close, duration);
    }

    return toast;
  }

  function ensureConfirmModal() {
    let backdrop = document.querySelector("#feedbackConfirmBackdrop");

    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "feedbackConfirmBackdrop";
      backdrop.className = "feedback-modal-backdrop";

      backdrop.innerHTML = `
        <div class="feedback-modal" role="dialog" aria-modal="true">
          <div class="feedback-modal-icon">!</div>

          <h3 class="feedback-modal-title" data-confirm-title>
            تأكيد العملية
          </h3>

          <p class="feedback-modal-text" data-confirm-message>
            هل أنت متأكد؟
          </p>

          <div class="feedback-modal-actions">
            <button class="feedback-btn feedback-btn-danger" type="button" data-confirm-ok>
              تأكيد
            </button>

            <button class="feedback-btn feedback-btn-cancel" type="button" data-confirm-cancel>
              إلغاء
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);
    }

    return backdrop;
  }

  function showConfirm({
    title = "تأكيد العملية",
    message = "هل أنت متأكد؟",
    confirmText = "تأكيد",
    cancelText = "إلغاء",
    variant = "danger",
  } = {}) {
    return new Promise((resolve) => {
      const backdrop = ensureConfirmModal();

      const titleEl = backdrop.querySelector("[data-confirm-title]");
      const messageEl = backdrop.querySelector("[data-confirm-message]");
      const okBtn = backdrop.querySelector("[data-confirm-ok]");
      const cancelBtn = backdrop.querySelector("[data-confirm-cancel]");

      titleEl.textContent = title;
      messageEl.textContent = message;
      okBtn.textContent = confirmText;
      cancelBtn.textContent = cancelText;

      okBtn.className =
        variant === "danger"
          ? "feedback-btn feedback-btn-danger"
          : "feedback-btn feedback-btn-primary";

      const cleanup = (result) => {
        backdrop.classList.remove("is-open");

        okBtn.onclick = null;
        cancelBtn.onclick = null;
        backdrop.onclick = null;

        resolve(result);
      };

      okBtn.onclick = () => cleanup(true);
      cancelBtn.onclick = () => cleanup(false);

      backdrop.onclick = (event) => {
        if (event.target === backdrop) {
          cleanup(false);
        }
      };

      backdrop.classList.add("is-open");
    });
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.showToast = showToast;
  window.showSuccess = (message, options = {}) =>
    showToast(message, "success", options);
  window.showError = (message, options = {}) =>
    showToast(message, "error", options);
  window.showWarning = (message, options = {}) =>
    showToast(message, "warning", options);
  window.showInfo = (message, options = {}) =>
    showToast(message, "info", options);
  window.showConfirm = showConfirm;
})();
