import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { isAuthenticated } = useSelector((s) => s.auth);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
