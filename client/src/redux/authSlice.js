import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUser: (state) => {
      ((state.user = null),
        (state.isAuthenticated = false),
        (state.loading = false),
        (state.error = null));
    },
  },
});

export const { clearError, clearUser } = authSlice.actions;
export default authSlice.reducer;
