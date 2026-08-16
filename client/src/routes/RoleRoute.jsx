import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function RoleRoute({ allow = [] }) {
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return allow.includes(user?.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/forbidden" replace />
  );
}
