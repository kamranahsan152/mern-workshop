import { useDispatch, useSelector } from "react-redux";
import { NavLink, Link } from "react-router-dom";
import { logout } from "../redux/authSlice";
function Navbar() {
  // NavLink gives you isActive for free
  const style = ({ isActive }) => ({
    color: isActive ? "#22d3ee" : "#94a3b8",
    marginRight: "16px",
  });
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();

  return (
    <nav>
      {/* {user ? (
  <>
    <Link to="/notes">Notes</Link>
    <span>Hi, {user.name}</span>
    <button onClick={() => dispatch(logout())}>Logout</button>
  </>
) : <Link to="/login">Login</Link>} */}

      {user?.email ? (
        <>
          <Link to="/notes">Notes</Link>
          <span>Hi, {user.email}</span>
          <button onClick={() => dispatch(logout())}>Logout</button>
          <NavLink to="/" style={style}>
            Home
          </NavLink>
          <NavLink to="/notes" style={style}>
            Notes
          </NavLink>
          <NavLink to="/workshop" style={style}>
            WorkShop
          </NavLink>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
      {/* <NavLink to="/add" style={style}>
        Add
      </NavLink> */}
    </nav>
  );
}

export default Navbar;
