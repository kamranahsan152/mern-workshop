import { useState } from "react";
import { Link } from "react-router-dom";

export default function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    // // Client-side checks are UX only. The server validates again.
    // if (form.password.length < 6) {
    //   return setLocalError("Password must be at least 6 characters");
    // }

    // const result = await dispatch(registerUser(form));
    // if (registerUser.fulfilled.match(result)) navigate("/dashboard");
  };

  return (
    <div className="card">
      <h1>Create account</h1>

      <form onSubmit={onSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={onChange}
          required
        />

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

        {/* {(localError || error) && (
          <p className="error">{localError || error}</p>
        )} */}

        {/* <button disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button> */}
        <button>Create Account</button>
      </form>

      <p className="muted">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
