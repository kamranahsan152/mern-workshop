// -----------------------------------------------------------------------------
// uploadSlice.js  —  ALL upload state lives here
//
// Two separate lists, and it matters that you understand the difference:
//
//   queue[]    files the user PICKED but has not finished uploading.
//              Each item has its own progress %, status and error.
//
//   photos[]   files that are SAVED ON THE SERVER. This is what the collage renders.
//
// A file starts life in `queue`, and once its upload succeeds we push the
// server's response into `photos`.
// -----------------------------------------------------------------------------
import { createSlice, createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import {
  uploadSingleFile,
  fetchAllFiles,
  deleteFileRequest,
} from "./uploadApi";

// ============================ THUNKS =========================================

/**
 * Upload one queued file.
 *
 * Key idea: the progress callback DISPATCHES an action on every tick.
 * That is how a number coming out of axios ends up inside the Redux store,
 * and how the progress bar re-renders as bytes go out.
 *
 * We pass the raw File through `extra` on the thunk arg rather than storing it
 * in Redux, because a File is not serialisable — Redux wants plain data only.
 */
export const uploadFileThunk = createAsyncThunk(
  "upload/uploadFile",
  async ({ id, file }, { dispatch, rejectWithValue }) => {
    try {
      const saved = await uploadSingleFile(file, (percent) => {
        dispatch(setProgress({ id, percent }));
      });
      return { id, saved };
    } catch (err) {
      // Prefer the server's JSON message; fall back to axios's message.
      const message =
        err.response?.data?.message || err.message || "Upload failed";
      return rejectWithValue({ id, message });
    }
  }
);

/** Load photos already on the server, so a refresh doesn't empty the collage. */
export const loadPhotosThunk = createAsyncThunk(
  "upload/loadPhotos",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAllFiles();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Remove a photo from the server and from the collage. */
export const deletePhotoThunk = createAsyncThunk(
  "upload/deletePhoto",
  async (filename, { rejectWithValue }) => {
    try {
      return await deleteFileRequest(filename);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ============================ SLICE ==========================================

const initialState = {
  queue: [], // [{ id, name, size, previewUrl, progress, status, error }]
  photos: [], // [{ filename, originalName, mimeType, size, url }]
  loadStatus: "idle", // idle | loading | succeeded | failed
  globalError: null,
};

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    /**
     * The user picked files. We store only SERIALISABLE metadata in Redux —
     * never the File object itself. The real File stays in a plain JS Map
     * outside the store (see fileRegistry below).
     */
    filesSelected(state, action) {
      action.payload.forEach((item) => {
        state.queue.push({
          id: item.id,
          name: item.name,
          size: item.size,
          previewUrl: item.previewUrl,
          progress: 0,
          status: "pending", // pending | uploading | success | error
          error: null,
        });
      });
    },

    /** Called many times per second while bytes are flying. */
    setProgress(state, action) {
      const item = state.queue.find((f) => f.id === action.payload.id);
      if (item) {
        item.progress = action.payload.percent;
        item.status = "uploading";
      }
    },

    /** Take a file out of the queue before it has been uploaded. */
    removeFromQueue(state, action) {
      state.queue = state.queue.filter((f) => f.id !== action.payload);
    },

    /** Clear finished items so the queue panel doesn't grow forever. */
    clearFinished(state) {
      state.queue = state.queue.filter((f) => f.status !== "success");
    },

    clearGlobalError(state) {
      state.globalError = null;
    },
  },

  // extraReducers handles the AUTOMATIC pending/fulfilled/rejected actions
  // that createAsyncThunk generates for us.
  extraReducers: (builder) => {
    builder
      // ---- uploading one file ----
      .addCase(uploadFileThunk.pending, (state, action) => {
        const item = state.queue.find((f) => f.id === action.meta.arg.id);
        if (item) {
          item.status = "uploading";
          item.error = null;
        }
      })
      .addCase(uploadFileThunk.fulfilled, (state, action) => {
        const { id, saved } = action.payload;
        const item = state.queue.find((f) => f.id === id);
        if (item) {
          item.status = "success";
          item.progress = 100;
        }
        // The saved file joins the collage, newest first.
        state.photos.unshift(saved);
      })
      .addCase(uploadFileThunk.rejected, (state, action) => {
        const { id, message } = action.payload || {};
        const item = state.queue.find((f) => f.id === id);
        if (item) {
          item.status = "error";
          item.error = message || "Upload failed";
        }
        state.globalError = message || "Upload failed";
      })

      // ---- loading existing photos ----
      .addCase(loadPhotosThunk.pending, (state) => {
        state.loadStatus = "loading";
      })
      .addCase(loadPhotosThunk.fulfilled, (state, action) => {
        state.loadStatus = "succeeded";
        state.photos = action.payload;
      })
      .addCase(loadPhotosThunk.rejected, (state, action) => {
        state.loadStatus = "failed";
        state.globalError =
          "Could not reach the server. Is it running on port 5000?";
      })

      // ---- deleting ----
      .addCase(deletePhotoThunk.fulfilled, (state, action) => {
        state.photos = state.photos.filter((p) => p.filename !== action.payload);
      });
  },
});

export const {
  filesSelected,
  setProgress,
  removeFromQueue,
  clearFinished,
  clearGlobalError,
} = uploadSlice.actions;

// ============================ SELECTORS ======================================
// Selectors keep components from digging into state shape directly.
export const selectQueue = (state) => state.upload.queue;
export const selectPhotos = (state) => state.upload.photos;
export const selectLoadStatus = (state) => state.upload.loadStatus;
export const selectGlobalError = (state) => state.upload.globalError;
export const selectIsUploading = (state) =>
  state.upload.queue.some((f) => f.status === "uploading");

export default uploadSlice.reducer;

// ============================ FILE REGISTRY ==================================
// A File object cannot go into Redux (it is not plain data). So we keep the
// real Files in a normal Map, keyed by the same id we stored in the queue.
export const fileRegistry = new Map();

/** Turn browser Files into queue metadata + stash the real File. */
export function registerFiles(fileList) {
  return Array.from(fileList).map((file) => {
    const id = nanoid();
    fileRegistry.set(id, file);
    return {
      id,
      name: file.name,
      size: file.size,
      // createObjectURL gives an instant local preview with NO server round trip.
      previewUrl: URL.createObjectURL(file),
    };
  });
}
