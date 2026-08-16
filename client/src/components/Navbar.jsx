import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
// import { logout } from "../redux/authSlice";

export default function Navbar() {
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  // Server first, then state. Clearing Redux alone is NOT logout.
  const handleLogout = async () => {
    // await dispatch(logout());
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
