import { createSlice } from "@reduxjs/toolkit";

// state
const User = [
  {
    email: "20021519-152@uog.edu.pk", // 3030033
    password: "12345", //3030033
    name: "Kamran Ahsan",
  },
];

const saved = JSON.parse(localStorage.getItem("user")) || null;

console.log("saved data", saved);

const initialState = {
  user: saved || {
    email: "",
    password: "",
    name: "",
  },
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { email, password } = action.payload;
      // payload
      //      {
      //   email: "20021519-152@uog.edu.pk",
      //   password: "12345",
      // },
      // Here you would typically make an API call to validate the user credentials
      // For demonstration purposes, we'll just check against a hardcoded user
      if (email === "" || password === "") {
        state.error = "Email and password are required";
      }
      const found = User.find(
        (u) => u.email === email && u.password === password,
      );
      if (!found) {
        state.error = "Invalid email or password";
        return;
      }
      // const
      state.user = { email, password, name: found.name };
      state.error = null;
      localStorage.setItem(
        "user",
        JSON.stringify({ email, password: "", name: found.name }),
      );
    },
    logout: (state) => {
      state.user = {
        email: "",
        password: "",
      };
      state.error = null;
      localStorage.removeItem("user");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
