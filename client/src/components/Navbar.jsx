import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { logout } from "../redux/authSlice";
function Navbar() {
  // NavLink gives you isActive for free
  const style = ({ isActive }) => ({
    color: isActive ? "red" : "#94a3b8",
    marginRight: "16px",
  });
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();

  return (
    <nav>
      {user?.email ? (
        <div
          style={{
            display: "flex",
            gap: "12px",
            paddingLeft: "12px",
            padding: "12px",
            border: "1px solid #eee",
          }}
        >
          <NavLink to="/notes" style={style}>
            Notes
          </NavLink>
          <NavLink to="/" style={style}>
            Home
          </NavLink>
          <NavLink to="/workshop" style={style}>
            WorkShop
          </NavLink>
          <div>
            <span
              style={{
                paddingRight: "12px",
                paddingLeft: "12px",
              }}
            >
              Hi, {user?.name}
            </span>
            <button onClick={() => dispatch(logout())}>Logout</button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

export default Navbar;
