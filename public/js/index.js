import "@babel/polyfill";

import { login, logout } from "./login";
import { displayMap } from "./mapbox";
import { updateSettings } from "./updateSettings";

const mapBox = document.getElementById("map");
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginForm = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");
const passwordDataForm = document.querySelector(".form-user-password");
if (mapBox) {
  const mapLocations = JSON.parse(mapBox.dataset.locations);
  displayMap(mapLocations);
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    login(email.value, password.value);
  });
}
if (logoutBtn) logoutBtn.addEventListener("click", logout);

if (userDataForm)
  userDataForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);
    console.log(form);
    updateSettings(form, "data");
  });

if (passwordDataForm)
  passwordDataForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating..";
    const currentPassword = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConform = document.getElementById("password-confirm").value;
    await updateSettings(
      { currentPassword, password, passwordConform },
      "password"
    );
    document.querySelector(".btn--save-password").textContent = "Save Password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
