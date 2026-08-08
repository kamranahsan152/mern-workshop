import { useParams, useNavigate } from "react-router-dom"; // useNavigate
function NoteDetail() {
  const { id } = useParams(); // id === "7"
  const navigate = useNavigate();
  console.log("NoteDetail id:", id);

  const onBackToNotes = () => {
    navigate("/notes");
  };

  return (
    <div>
      <h2>Note #{id}</h2>
      {/* <Link to="/notes">Back to all notes</Link> */}
      <button onClick={onBackToNotes}>back to notes</button>
    </div>
  );
}

export default NoteDetail;
