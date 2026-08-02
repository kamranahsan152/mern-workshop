function TaskItem({ task, onDelete }) {
  return (
    <li>
      {/* <input type="checkbox"
             checked={task.done}
             onChange={() => onToggle(task.id)} 
             /> */}

      <span
      //   style={{ textDecoration: task.done ? "line-through" : "none" }}
      >
        {task.text}
      </span>

      <button onClick={() => onDelete(task.id)}>✕</button>
    </li>
  );
}
export default TaskItem;
