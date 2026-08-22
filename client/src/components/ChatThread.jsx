import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "../socket";
import { historyLoaded, chatError, chatClosed } from "../redux/chatSlice";

export default function ChatThread() {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.auth.user);
  const { activeUser, messages, isConnected } = useSelector(
    (state) => state.chat,
  );
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!activeUser) return;

    socket.emit("chat:history", activeUser._id, (result) => {
      if (result?.error) return dispatch(chatError(result.error));
      dispatch(historyLoaded(result.messages));
    });
  }, [dispatch, activeUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = (event) => {
    event.preventDefault();
    if (!text.trim()) return;

    socket.emit(
      "chat:send",
      { to: activeUser._id, text: text.trim() },
      (result) => {
        if (result?.error) dispatch(chatError(result.error));
      },
    );
    setText("");
  };

  return (
    <>
      <header className="chat-header">
        <span className="avatar">{activeUser.name[0]?.toUpperCase()}</span>
        <strong>{activeUser.name}</strong>
        <button className="ghost" onClick={() => dispatch(chatClosed())}>
          Close
        </button>
      </header>

      <ul className="chat-messages">
        {messages.length === 0 && (
          <p className="muted">No messages yet. Say hi.</p>
        )}
        {messages.map((message) => (
          <li
            key={message._id}
            className={message.sender._id === me?.id ? "mine" : "theirs"}
          >
            <p>{message.text}</p>
            <time>{new Date(message.createdAt).toLocaleTimeString()}</time>
          </li>
        ))}
        <div ref={bottomRef} />
      </ul>

      <form className="chat-form" onSubmit={onSubmit}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={`Message ${activeUser.name}…`}
          aria-label="Message"
        />
        <button disabled={!isConnected}>Send</button>
      </form>
    </>
  );
}
