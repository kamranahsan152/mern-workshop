import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNote, deleteNote, fetchNotes } from "../redux/feature/noteService";

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { notes: items, isLoading: loading, error } = useSelector(
    (s) => s.notes,
  );

  const [form, setForm] = useState({ title: "", body: "" });

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const result = await dispatch(addNote(form));
    if (addNote.fulfilled.match(result)) setForm({ title: "", body: "" });
  };

  return (
    <div className="stack">
      <div className="card">
        <h1>Hello, {user?.name}</h1>
      </div>

      <div className="card">
        <h2>Add a note</h2>
        <form onSubmit={onSubmit}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <label htmlFor="body">Body</label>
          <textarea
            id="body"
            rows="3"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />

          <button>Add note</button>
        </form>
      </div>

      <div className="card">
        <h2>Your notes</h2>
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && items.length === 0 && (
          <p className="muted">No notes yet.</p>
        )}

        <ul className="notes">
          {items.map((n) => (
            <li key={n._id}>
              <div>
                <strong>{n.title}</strong>
                {n.body && <p className="muted">{n.body}</p>}
              </div>
              <button
                className="ghost"
                onClick={() => dispatch(deleteNote(n._id))}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
