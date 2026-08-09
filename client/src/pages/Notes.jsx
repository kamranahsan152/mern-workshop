import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNote,
  deleteNote,
  fetchNotes,
  updateNote,
} from "../redux/noteSlice";

const Notes = () => {
  const dispatch = useDispatch();

  const { notes, isLoading, error } = useSelector((state) => state.notes);
  const [view, setView] = useState(null);
  const [edit, setEdit] = useState(null);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  if (isLoading) {
    return <p style={{ color: "green" }}>Loading........</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  const handleEdit = (e, id) => {
    e.preventDefault();
    const { title, body } = e.target.elements;
    dispatch(updateNote({ _id: id, title: title.value, body: body.value }));
    setEdit(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { title, body } = e.target.elements;
    dispatch(addNote({ title: title.value, body: body.value }));
    e.target.reset();
  };

  return (
    <div>
      <h1>Notes Page</h1>
      <ul>
        {notes?.map((n) => {
          return (
            <li
              key={n._id}
              style={{
                paddingTop: "12px",
                paddingBottom: "12px",
              }}
            >
              {edit === n._id ? (
                <>
                  <label htmlFor="edit"> Edit this note</label>
                  <form onSubmit={(e) => handleEdit(e, n._id)}>
                    <input type="text" name="title" defaultValue={n.title} />
                    <input type="text" name="body" defaultValue={n.body} />
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEdit(null)}>
                      Cancel
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {n.title}
                  {view === n._id && (
                    <>
                      <br />
                      {n.body}
                    </>
                  )}
                </>
              )}
              <br />
              <button
                style={{
                  marginTop: "10px",
                }}
                onClick={() => setView(view === n._id ? null : n._id)}
              >
                {view !== n._id ? "View Notes" : "Hide Notes"}
              </button>
              <button
                style={{
                  marginTop: "10px",
                  marginLeft: "10px",
                }}
                onClick={() => setEdit(n._id)}
              >
                Edit
              </button>
              <button
                style={{
                  marginLeft: "10px",
                }}
                onClick={() => dispatch(deleteNote(n._id))}
              >
                Delete
              </button>
            </li>
          );
        })}
      </ul>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="add title" />
        <input type="text" name="body" placeholder="add content" />
        <button type="submit">Add Notes</button>
      </form>
    </div>
  );
};

export default Notes;
