import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Show search bar only on HomePage
  const showSearch = location.pathname === "/";

  // Search form state
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getDashboardRoute = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "organizer") return "/organizer/dashboard";
    return "/attendee/dashboard";
  };

  // Handle search submit → build URL → navigate
  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (keyword) params.append("keyword", keyword);
    if (category) params.append("category", category);
    if (locationFilter) params.append("location", locationFilter);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    navigate("/?" + params.toString());
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">

        <Link className="navbar-brand" to="/">EMS</Link>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">

            {/* 🔍 SEARCH BAR (ONLY ON HOMEPAGE) */}
            {showSearch && (
              <form
                className="d-flex align-items-center me-3 gap-2"
                onSubmit={handleSearch}
              >
                {/* Title keyword */}
                <input
                  className="form-control"
                  placeholder="Title keyword..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />

                {/* Category Dropdown */}
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Category</option>
                  <option value="Music">Music</option>
                  <option value="Tech">Tech</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Conference">Conference</option>
                </select>

                {/* Location */}
                <input
                  className="form-control"
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />

                {/* Date Range */}
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />

                <button className="btn btn-primary">Search</button>
              </form>
            )}

            {/* AUTH LINKS */}
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

            {/* USER LOGGED IN */}
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
                    style={{ cursor: "pointer" }}
                    onClick={logout}
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
