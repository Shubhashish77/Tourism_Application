import axios from "axios";
import { showAlert } from "./alerts";
import { async } from "regenerator-runtime";


export const login = async (email, password) => {
  try {
    console.log("login 2");
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/v1/users/login",
      data: {
        email: email,
        password: password,
      },
    });
    if (res.data.status === "success") {
      showAlert("success","Logged in successfully");
      window.setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
  } catch (err) {
    showAlert("error",err.response.data.message);
  }
};


export const logout = async () =>{
  try{
    const res = await axios({
      method: "GET",
      url : "http://127.0.0.1:8000/api/v1/users/logout",
    })
    if (res.data.status === "success") {
      location.reload(true);
    }
  } catch(err){
    console.log(err)
    showAlert("error", "Error logging out! Try again.")
  }
}
