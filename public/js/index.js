import "@babel/polyfill";

import { login } from "./login";
import { displayMap } from "./mapbox";

const mapBox = document.getElementById("map");
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginForm = document.querySelector(".form");
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
