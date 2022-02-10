/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:3000/api/v1/users/login",
      data: {
        email,
        password,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
    2;
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
export const logout = async () => {
  try {
    const res = await axios.get("http://127.0.0.1:3000/api/v1/users/logout");
    console.log(res.data);
    if (res.data.status === "success") {
      location.reload(true);
    }
  } catch (err) {
    showAlert("error", "Erro logging out ! Try again");
  }
};
