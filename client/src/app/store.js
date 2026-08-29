// -----------------------------------------------------------------------------
// store.js — one store for the whole app.
// -----------------------------------------------------------------------------
import { configureStore } from "@reduxjs/toolkit";
import uploadReducer from "../features/upload/uploadSlice";

export const store = configureStore({
  reducer: {
    // state.upload  ->  handled by uploadReducer
    upload: uploadReducer,
  },
  // We never put File objects or blobs in the store, so the default
  // serializability check passes. Left explicit here so students see the option.
  middleware: (getDefault) => getDefault({ serializableCheck: true }),
});
