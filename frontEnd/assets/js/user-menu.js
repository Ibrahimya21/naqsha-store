import { getCurrentUser, clearAuthData } from "./api/http.js";

const userMenuButton = document.getElementById("userMenuButton");
const userDropdownMenu = document.getElementById("userDropdownMenu");
const userMenuLabel = document.getElementById("userMenuLabel");
const dropdownUserName = document.getElementById("dropdownUserName");
const dropdownUserRole = document.getElementById("dropdownUserRole");
const logoutButton = document.getElementById("logoutButton");
const profileLink = document.getElementById("profileLink");
const adminDashboardLink = document.getElementById("adminDashboardLink");
if (profileLink) profileLink.textContent = "تغيير كلمة السر";

function renderUserMenu() {
  const user = getCurrentUser();

  if (user) {
    userMenuLabel.textContent = user.full_name || "المستخدم";
    dropdownUserName.textContent = user.full_name || "المستخدم";
    dropdownUserRole.textContent = user.role === "admin" ? "أدمن" : "مستخدم";

    logoutButton.classList.remove("d-none");
    profileLink.classList.remove("d-none");

    if (user.role === "admin") {
      adminDashboardLink.classList.remove("d-none");
    } else {
      adminDashboardLink.classList.add("d-none");
    }
  } else {
    userMenuLabel.textContent = "تسجيل الدخول";
    dropdownUserName.textContent = "زائر";
    dropdownUserRole.textContent = "غير مسجل";

    logoutButton.classList.add("d-none");
    profileLink.classList.add("d-none");
    adminDashboardLink.classList.add("d-none");
  }
}

function toggleDropdown() {
  userDropdownMenu.classList.toggle("d-none");
}

function closeDropdown() {
  userDropdownMenu.classList.add("d-none");
}

if (userMenuButton) {
  userMenuButton.addEventListener("click", (e) => {
    e.preventDefault();

    const user = getCurrentUser();

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    toggleDropdown();
  });
}

document.addEventListener("click", (e) => {
  if (
    userMenuWrapperExists() &&
    !userMenuButton.contains(e.target) &&
    !userDropdownMenu.contains(e.target)
  ) {
    closeDropdown();
  }
});

function userMenuWrapperExists() {
  return userMenuButton && userDropdownMenu;
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    clearAuthData();
    window.location.href = "login.html";
  });
}

document.addEventListener("DOMContentLoaded", renderUserMenu);
renderUserMenu();
