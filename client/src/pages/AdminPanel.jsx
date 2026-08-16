export default function AdminPanel() {
  return (
    <div className="card">
      <h1>All users</h1>
      <p className="muted">
        This page is guarded twice: <code>RoleRoute</code> in the UI and
        <code> requireRole("admin")</code> on the server. Only the second one
        actually protects anything.
      </p>

      {/* {error && <p className="error">{error}</p>} */}

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {/* {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))} */}
        </tbody>
      </table>
    </div>
  );
}
