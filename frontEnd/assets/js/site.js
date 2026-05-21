document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const STORAGE_KEYS = {
    flash: "naqsha.flash.v1",
  };

  const UI_TEXT = {
    uploadDefault: "انقر لتحميل الملف أو اسحبه هنا",
    uploadSelectedPrefix: "تم اختيار الملف: ",
    showPassword: "إظهار كلمة السر",
    hidePassword: "إخفاء كلمة السر",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
  };

  const CART_STORAGE_KEYS = ["naqsha.cart.v2", "naqsha_cart", "cart"];

  function readJsonStorage(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage write errors.
    }
  }

  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage remove errors.
    }
  }

  function getCurrentUser() {
    return (
      readJsonStorage("user") ||
      readJsonStorage("naqsha.user") ||
      readJsonStorage("naqsha_user")
    );
  }

  function persistFlash(message) {
    writeJsonStorage(STORAGE_KEYS.flash, { message });
  }

  function consumeFlash() {
    const flash = readJsonStorage(STORAGE_KEYS.flash, null);

    if (!flash || !flash.message) {
      return "";
    }

    removeStorage(STORAGE_KEYS.flash);
    return flash.message;
  }

  function showToast(message) {
    if (!message) return;

    let stack = document.querySelector(".site-toast-stack");

    if (!stack) {
      stack = document.createElement("div");
      stack.className = "site-toast-stack";
      document.body.appendChild(stack);
    }

    const toast = document.createElement("div");
    toast.className = "site-toast";
    toast.textContent = message;
    stack.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("is-visible");
    });

    setTimeout(() => {
      toast.classList.remove("is-visible");

      setTimeout(() => {
        toast.remove();
      }, 220);
    }, 2600);
  }

  function getLocalCartCount() {
    for (const key of CART_STORAGE_KEYS) {
      const cart = readJsonStorage(key, null);

      if (!cart) continue;

      if (Array.isArray(cart)) {
        return cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
      }

      if (Array.isArray(cart.items)) {
        return cart.items.reduce(
          (sum, item) => sum + Number(item.quantity || 1),
          0,
        );
      }

      if (Array.isArray(cart.cart_items)) {
        return cart.cart_items.reduce(
          (sum, item) => sum + Number(item.quantity || 1),
          0,
        );
      }
    }

    return 0;
  }

  function syncCartIndicators() {
    const count = getLocalCartCount();

    document
      .querySelectorAll(".topbar .icon-btn[href='cart.html']")
      .forEach((link) => {
        link.classList.add("has-cart-count");

        let badge = link.querySelector(".cart-count-badge");

        if (!badge) {
          badge = document.createElement("span");
          badge.className = "cart-count-badge";
          link.appendChild(badge);
        }

        badge.hidden = count === 0;
        badge.textContent = count > 99 ? "99+" : String(count);
      });

    document
      .querySelectorAll(".topbar .nav a[href='cart.html']")
      .forEach((link) => {
        if (!link.dataset.baseLabel) {
          link.dataset.baseLabel = link.textContent.trim();
        }

        link.textContent = count
          ? `${link.dataset.baseLabel} (${count})`
          : link.dataset.baseLabel;
      });
  }

  function setNavState(toggle, nav, isOpen) {
    nav.classList.toggle("is-open", isOpen);
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? UI_TEXT.closeMenu : UI_TEXT.openMenu,
    );
    document.body.classList.toggle("nav-open", isOpen);
  }

  function initNav() {
    const navToggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");
    const topbar = document.querySelector(".topbar");


    if (!navToggle || !nav) return;

    navToggle.addEventListener("click", () => {
      const isOpen = !nav.classList.contains("is-open");
      setNavState(navToggle, nav, isOpen);
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;

      if (nav.contains(event.target) || navToggle.contains(event.target)) {
        return;
      }

      setNavState(navToggle, nav, false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setNavState(navToggle, nav, false);
      }
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        setNavState(navToggle, nav, false);
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 992 && nav.classList.contains("is-open")) {
        setNavState(navToggle, nav, false);
      }
    });
  }

  function initYear() {
    document.querySelectorAll("[data-year]").forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });
  }

  function initPasswordToggles() {
    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
      const inputId = button.getAttribute("aria-controls");
      const input = inputId ? document.getElementById(inputId) : null;

      if (!input) return;

      button.addEventListener("click", () => {
        const isVisible = input.type === "text";

        input.type = isVisible ? "password" : "text";
        button.setAttribute("aria-pressed", String(!isVisible));
        button.setAttribute(
          "aria-label",
          isVisible ? UI_TEXT.showPassword : UI_TEXT.hidePassword,
        );
      });
    });
  }

  function initFileUploadLabel() {
    const fileInput = document.getElementById("receipt");
    const uploadText = document.querySelector("[data-upload-text]");

    if (!fileInput || !uploadText) return;

    fileInput.addEventListener("change", () => {
      uploadText.textContent =
        fileInput.files && fileInput.files.length
          ? `${UI_TEXT.uploadSelectedPrefix}${fileInput.files[0].name}`
          : UI_TEXT.uploadDefault;
    });
  }

  function initAdminLink() {
    const user = getCurrentUser();
    const adminLink = document.getElementById("admin-link");

    if (adminLink && user?.role === "admin") {
      adminLink.style.display = "inline-flex";
    }
  }

  function initDisabledLinks() {
    document.addEventListener("click", (event) => {
      const disabledLink = event.target.closest(
        "a.is-disabled, [aria-disabled='true']",
      );

      if (!disabledLink) return;

      event.preventDefault();
    });
  }

  function initDemoForms() {
    document.querySelectorAll("form[data-demo-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const redirectTarget = form.dataset.redirect;
        const successMessage =
          form.dataset.successMessage || "تم حفظ البيانات بنجاح.";

        if (redirectTarget) {
          persistFlash(successMessage);
          window.location.href = redirectTarget;
          return;
        }

        let feedback = form.querySelector(".form-feedback");

        if (!feedback) {
          feedback = document.createElement("p");
          feedback.className = "form-feedback";
          feedback.setAttribute("role", "status");
          form.appendChild(feedback);
        }

        feedback.textContent = successMessage;
      });
    });
  }

  initAdminLink();
  initNav();
  initYear();
  initPasswordToggles();
  initFileUploadLabel();
  initDisabledLinks();
  initDemoForms();
  syncCartIndicators();

  const flashMessage = consumeFlash();

  if (flashMessage) {
    showToast(flashMessage);
  }

  window.naqshaSite = {
    syncCartIndicators,
    showToast,
    persistFlash,
  };
});
