import { createSlice } from "@reduxjs/toolkit";
import { fetchUsers } from "./feature/adminService";

const adminSlice = createSlice({
  name: "admin",
  initialState: { users: [], isLoading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to load";
      });
  },
});

export default adminSlice.reducer;
