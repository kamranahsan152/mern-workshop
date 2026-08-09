import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { login } from "../redux/authSlice";
// import { login } from "../features/auth/authSlice";

export default function Login() {
  const dispatch = useDispatch();

  const { user, error } = useSelector((state) => state.auth);

  console.log("user:", user, "error:", error);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // type login
    // payload = { email, password }
    dispatch(login({ email, password })); // the only Redux line
  }

  if (user?.email) return <Navigate to="/notes" replace />;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100dvh",
      }}
    >
      <form
        style={{
          display: "flex",
          width: "200px",
          justifyContent: "center",
          flexDirection: "column",
          gap: "8px",
        }}
        onSubmit={handleSubmit}
      >
        <label htmlFor="email">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {user?.email ? (
          <p style={{ color: "green" }}>Logged in as {user.email}</p>
        ) : null}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          style={{
            marginTop: "12px",
          }}
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}
