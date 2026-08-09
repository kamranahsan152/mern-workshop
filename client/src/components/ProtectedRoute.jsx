import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = useSelector((s) => s.auth.user);
  console.log("user", user);

  // user = null
  // user.email = undefined
  // user?.email = value, // null check

  return user.email ? children : <Navigate to="/login" replace />;
}
