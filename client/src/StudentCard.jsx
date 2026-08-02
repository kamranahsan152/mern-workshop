function StudentCard({ student }) {
  // {
  //   id: 1,
  //   name: "test",
  //   role: "text"
  // }
  return (
    <article key={student.id} className="card">
      <h2>{student.name}</h2>
      <p>Track: {student.role}</p>
    </article>
  );
}

export default StudentCard;
