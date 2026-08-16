import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="card">
      <h1>403 — Forbidden</h1>
      <p className="muted">
        You are signed in, but your role does not allow this page.
      </p>
      <Link to="/dashboard">Back to dashboard</Link>
    </div>
  );
}
