import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/feature/authService";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <nav className="nav">
      <Link to="/dashboard" className="brand">
        Auth
      </Link>

      <div className="nav-right">
        {isAuthenticated ? (
          <>
            <span className="who">
              {user?.name} <em>({user?.role})</em>
            </span>
            {user?.role === "admin" && <Link to="/admin">Admin</Link>}
            <button className="ghost" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
