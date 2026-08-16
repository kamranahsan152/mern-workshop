import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const registerUser = createAsyncThunk(
  "auth/register",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/register", body);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg ?? "Failed");
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/login", body);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg ?? "Failed");
    }
  },
);

export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/details");
      return data.user;
    } catch (err) {
      return rejectWithValue(err); // simply not logged in
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await api.post("/logout"); // server clears the cookie
  return true;
});
