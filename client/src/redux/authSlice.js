// import { createSlice } from "@reduxjs/toolkit";

// const USERS = [                       // demo users, no backend yet
//   { email: "student@uog.edu", password: "12345", name: "Ali" },
// ];

// const saved = JSON.parse(localStorage.getItem("user")) || null;

// const authSlice = createSlice({
//   name: "auth",
//   initialState: { user: saved, error: null },
//   reducers: {
//     login: (state, action) => {
//       const { email, password } = action.payload;
//       const found = USERS.find(
//         u => u.email === email && u.password === password
//       );
//       if (!found) { state.error = "Invalid email or password"; return; }
//       state.user  = { email: found.email, name: found.name };
//       state.error = null;
//       localStorage.setItem("user", JSON.stringify(state.user));
//     },
//     logout: (state) => {
//       state.user = null;
//       localStorage.removeItem("user");
//     },
//   },
// });

// export const { login, logout } = authSlice.actions;
// export default authSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    email: "",
    password: "",
  },
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { email, password } = action.payload;
      // Here you would typically make an API call to validate the user credentials
      // For demonstration purposes, we'll just check against a hardcoded user
      if (email === "" || password === "") {
        state.error = "Email and password are required";
      }
      state.user = { email, password };
      state.error = null;
    },
    logout: (state) => {
      state.user = {
        email: "",
        password: "",
      };
      state.error = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
