import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = useSelector((s) => s.auth.user);
  return user?.email ? children : <Navigate to="/login" replace />;
}
