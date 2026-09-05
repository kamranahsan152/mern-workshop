import { io } from "socket.io-client";

// Connect only after the user is authenticated.
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
  withCredentials: true,
  autoConnect: false,
});

export default socket;
