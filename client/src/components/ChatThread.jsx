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
  const isTyping = useSelector(
    (state) => Boolean(state.chat.typingByUser[activeUser?._id]),
  );
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

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

  useEffect(
    () => () => {
      window.clearTimeout(typingTimer.current);
      if (activeUser) {
        socket.emit("chat:typing", { to: activeUser._id, isTyping: false });
      }
    },
    [activeUser],
  );

  const onTextChange = (event) => {
    const value = event.target.value;
    setText(value);
    if (activeUser.role === "bot") return;

    socket.emit("chat:typing", { to: activeUser._id, isTyping: true });
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(
      () => socket.emit("chat:typing", { to: activeUser._id, isTyping: false }),
      700,
    );
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!text.trim()) return;

    window.clearTimeout(typingTimer.current);
    socket.emit("chat:typing", { to: activeUser._id, isTyping: false });

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
        <span className="avatar">
          {activeUser.role === "bot"
            ? "🤖"
            : activeUser.name[0]?.toUpperCase()}
        </span>
        <strong>{activeUser.name}</strong>
        {isTyping && <span className="typing-label">is typing…</span>}
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
        {isTyping && activeUser.role === "bot" && (
          <li className="typing-bubble" aria-label="Chatbot is typing">
            <span className="typing-dots"><i /><i /><i /></span>
          </li>
        )}
        <div ref={bottomRef} />
      </ul>

      <form className="chat-form" onSubmit={onSubmit}>
        <input
          value={text}
          onChange={onTextChange}
          placeholder={`Message ${activeUser.name}…`}
          aria-label="Message"
        />
        <button disabled={!isConnected}>Send</button>
      </form>
    </>
  );
}
