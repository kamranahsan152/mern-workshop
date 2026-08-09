import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchNotes = createAsyncThunk(
  "notes/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:3000/notes");
      return response.data.notes;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deleteNote = createAsyncThunk(
  "notes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:3000/notes/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const addNote = createAsyncThunk(
  "notes/add",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:3000/notes", payload);
      return response.data.notes;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateNote = createAsyncThunk(
  "notes/update",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/notes/${payload._id}`,
        { title: payload.title, body: payload.body },
      );
      return response.data.note;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

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
    builder.addCase(fetchNotes.rejected, (state) => {
      state.isLoading = false;
      state.error = "SERVER ERROR";
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
