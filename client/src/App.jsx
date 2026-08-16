import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Forbidden from "./pages/Forbidden";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import { useDispatch } from "react-redux";
import { fetchMe } from "./redux/feature/authService";
import { useEffect } from "react";

export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forbidden" element={<Forbidden />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route element={<RoleRoute allow={["admin"]} />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
