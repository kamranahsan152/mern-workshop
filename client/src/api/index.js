import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // send + receive cookies
});

export default api;

///api.post("/login"),  "/register"
