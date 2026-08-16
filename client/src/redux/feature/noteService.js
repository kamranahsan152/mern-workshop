import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const fetchNotes = createAsyncThunk(
  "notes/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/notes");
      return data.notes;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg ?? "Failed");
    }
  },
);

export const addNote = createAsyncThunk(
  "notes/add",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/notes", payload);
      return data.note;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg ?? "Failed");
    }
  },
);

export const updateNote = createAsyncThunk(
  "notes/update",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/notes/${payload._id}`, {
        title: payload.title,
        body: payload.body,
      });
      return data.note;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg ?? "Failed");
    }
  },
);

export const deleteNote = createAsyncThunk(
  "notes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notes/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg ?? "Failed");
    }
  },
);
