import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // send + receive cookies
});

export default api;

///api.post("/login"),  "/register"
