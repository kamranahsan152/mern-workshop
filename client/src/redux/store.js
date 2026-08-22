import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import noteReducer from "./noteSlice";
import adminReducer from "./adminSlice";
import chatReducer from "./chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: noteReducer,
    admin: adminReducer,
    chat: chatReducer,
  },
});
