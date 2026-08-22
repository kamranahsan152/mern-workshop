import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../api";
import socket from "../socket";
import ChatThread from "../components/ChatThread";
import {
  usersLoaded,
  chatOpened,
  messageReceived,
  connectionChanged,
  chatError,
} from "../redux/chatSlice";

export default function Chat() {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.auth.user);
  const { users, activeUser, isConnected, error } = useSelector(
    (state) => state.chat,
  );

  useEffect(() => {
    api
      .get("/chat/users")
      .then(({ data }) => dispatch(usersLoaded(data.users)))
      .catch((err) =>
        dispatch(chatError(err.response?.data?.msg ?? "Failed to load users")),
      );
  }, [dispatch]);

  useEffect(() => {
    socket.on("connect", () => dispatch(connectionChanged(true)));
    socket.on("disconnect", () => dispatch(connectionChanged(false)));
    socket.on("connect_error", (err) => dispatch(chatError(err.message)));
    socket.on("chat:message", (message) =>
      dispatch(messageReceived(message, me?.id)),
    );

    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("chat:message");
      socket.disconnect();
    };
  }, [dispatch, me?.id]);

  return (
    <div className="chat-layout">
      <aside className="card chat-sidebar">
        <h2>
          Chats{" "}
          <span className="muted">{isConnected ? "online" : "offline"}</span>
        </h2>
        {error && <p className="error">{error}</p>}
        {users.length === 0 && <p className="muted">No other users yet.</p>}

        <ul className="chat-users">
          {users.map((user) => (
            <li key={user._id}>
              <button
                className={
                  user._id === activeUser?._id
                    ? "chat-user active"
                    : "chat-user"
                }
                onClick={() => dispatch(chatOpened(user))}
              >
                <span className="avatar">{user.name[0]?.toUpperCase()}</span>
                <span>
                  <strong>{user.name}</strong>
                  <small className="muted">{user.email}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="card chat-main">
        {activeUser ? (
          <ChatThread />
        ) : (
          <p className="muted">Select a chat to start messaging.</p>
        )}
      </section>
    </div>
  );
}
