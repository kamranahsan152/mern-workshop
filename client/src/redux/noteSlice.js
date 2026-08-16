import { createSlice } from "@reduxjs/toolkit";
import {
  fetchNotes,
  addNote,
  updateNote,
  deleteNote,
} from "./feature/noteService";

const noteSlice = createSlice({
  name: "notes",
  initialState: { notes: [], isLoading: false, error: null },
  extraReducers: (builder) => {
    builder.addCase(fetchNotes.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchNotes.fulfilled, (state, action) => {
      state.notes = action.payload;
      state.isLoading = false;
    });
    builder.addCase(fetchNotes.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload ?? "SERVER ERROR";
    });
    builder.addCase(deleteNote.fulfilled, (state, action) => {
      state.notes = state.notes.filter((n) => n._id !== action.payload);
    });
    builder.addCase(addNote.fulfilled, (state, action) => {
      state.notes.push(action.payload);
    });
    builder.addCase(updateNote.fulfilled, (state, action) => {
      state.notes = state.notes.map((n) =>
        n._id === action.payload._id ? action.payload : n,
      );
    });
  },
});

export default noteSlice.reducer;
