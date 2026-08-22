import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    users: [],
    activeUser: null,
    messages: [],
    isConnected: false,
    error: null,
  },
  reducers: {
    usersLoaded: (state, action) => {
      state.users = action.payload;
    },
    chatOpened: (state, action) => {
      state.activeUser = action.payload;
      state.messages = [];
    },
    chatClosed: (state) => {
      state.activeUser = null;
      state.messages = [];
    },
    historyLoaded: (state, action) => {
      state.messages = action.payload;
    },
    messageReceived: {
      prepare: (msg, me) => ({ payload: { msg, me } }),
      reducer: (state, action) => {
        const { msg, me } = action.payload;
        const other = msg.sender._id === me ? msg.recipient : msg.sender._id;

        // Keep only messages for the currently open conversation.
        if (other !== state.activeUser?._id) return;
        if (state.messages.some((item) => item._id === msg._id)) return;

        state.messages.push(msg);
      },
    },
    connectionChanged: (state, action) => {
      state.isConnected = action.payload;
    },
    chatError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  usersLoaded,
  chatOpened,
  chatClosed,
  historyLoaded,
  messageReceived,
  connectionChanged,
  chatError,
} = chatSlice.actions;

export default chatSlice.reducer;
