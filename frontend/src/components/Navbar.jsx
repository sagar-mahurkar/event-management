import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  // Dynamically choose dashboard route
  const getDashboardRoute = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "organizer") return "/organizer/dashboard";
    return "/attendee/dashboard";
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">

        <Link className="navbar-brand" to="/">EMS</Link>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">

            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}

            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to={getDashboardRoute()}>
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link"
                    onClick={logout}
                    style={{ cursor: "pointer" }}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
