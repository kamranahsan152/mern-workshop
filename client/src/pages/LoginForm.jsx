import { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    // const result = await dispatch(loginUser(form));
    // The RTK way to check success — no try/catch in the component.
    // if (loginUser.fulfilled.match(result)) navigate("/dashboard");
  };

  return (
    <div className="card">
      <h1>Sign in</h1>

      <form onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
        />

        {/* {error && <p className="error">{error}</p>} */}

        {/* <button disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button> */}
        <button>Sign in</button>
      </form>

      <p className="muted">
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
