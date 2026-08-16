import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/users");
      return data.users;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg ?? "Failed to load");
    }
  },
);
