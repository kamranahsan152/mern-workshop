import { useState } from "react";

export default function TaskInput({ onAdd }) {
  const [text, setText] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim(); // "Workshop"
    if (!trimmed) return;

    console.log("onSubmit", trimmed);

    onAdd(trimmed);
    setText("");
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        value={text}
        onChange={(e) => {
          console.log("text", e.target.value);
          setText(e.target.value);
        }}
        placeholder="Add New task"
      />
      <button type="submit">Add Task</button>
    </form>
  );
}
