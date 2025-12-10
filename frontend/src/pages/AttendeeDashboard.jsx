import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AttendeeDashboard = () => {
  const [selected, setSelected] = useState("upcoming");
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- FIX BASE URL (remove trailing slash) ----
  const usersBase = `${(BASE_URL || "").replace(/\/+$/, "")}/users`;

  const axiosAuth = axios.create({
    baseURL: usersBase,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // ---- LOAD BOOKINGS ----
  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching bookings from:", usersBase + "/bookings");

      const res = await axiosAuth.get("/bookings");
      console.log("Bookings response:", res.data);

      const list = res.data.bookings || res.data.data?.bookings || res.data.data || [];

      const now = new Date();
      const upcomingArr = [];
      const pastArr = [];
      const cancelledArr = [];

      list.forEach((b) => {
        const eventDate = new Date(b.event?.dateTime || 0);

        if (b.status === "cancelled") cancelledArr.push(b);
        else if (eventDate > now) upcomingArr.push(b);
        else pastArr.push(b);
      });

      upcomingArr.sort((a, b) => new Date(a.event.dateTime) - new Date(b.event.dateTime));
      pastArr.sort((a, b) => new Date(b.event.dateTime) - new Date(a.event.dateTime));

      setUpcoming(upcomingArr);
      setPast(pastArr);
      setCancelled(cancelledArr);
    } catch (err) {
      console.error("Error loading bookings:", err.response || err);
      setError("Failed to load your bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // ---- ROLE UPGRADE REQUEST ----
  const handleRoleUpgrade = async () => {
    const token = localStorage.getItem("token");
    console.log("Attempting role upgrade...");
    console.log("Token:", token);
    console.log("Request URL:", usersBase + "/request");

    if (!token) {
      alert("No token found! Please login again.");
      return;
    }

    if (!confirm("Do you want to request Organizer role?")) return;

    try {
      const res = await axiosAuth.post("/request", {}, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Role upgrade response:", res);
      alert("Organizer role request submitted successfully!");
    } catch (err) {
      console.error("Role upgrade error:", err.response || err);
      alert(`Failed to submit request: ${err.response?.data?.message || err.message}`);
    }
  };

  // ---- TABLE COMPONENT ----
  const BookingTable = ({ title, data }) => (
    <div>
      <h3>{title}</h3>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Event</th>
            <th>Date/Time</th>
            <th>Location</th>
            <th>Category</th>
            <th>Booked At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">No records found</td>
            </tr>
          ) : (
            data.map((b, i) => (
              <tr key={b.id}>
                <td>{i + 1}</td>
                <td>{b.event?.title}</td>
                <td>{b.event?.dateTime ? new Date(b.event.dateTime).toLocaleString() : "-"}</td>
                <td>{b.event?.location}</td>
                <td>{b.event?.category}</td>
                <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}</td>
                <td className={b.status === "cancelled" ? "text-danger" : "text-success"}>{b.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    if (loading) return <p>Loading…</p>;
    if (error) return <p className="text-danger">{error}</p>;

    if (selected === "upcoming") return <BookingTable title="Upcoming Events" data={upcoming} />;
    if (selected === "past") return <BookingTable title="Past Events" data={past} />;
    if (selected === "cancelled") return <BookingTable title="Cancelled Bookings" data={cancelled} />;
  };

  return (
    <div className="d-flex" style={{ width: "100%" }}>

      {/* SIDEBAR */}
      <div
        style={{
          width: "15%",
          minHeight: "100vh",
          background: "#f7f7f7",
          padding: "1rem",
          borderRight: "1px solid #ddd",
        }}
      >
        <h4>Attendee Menu</h4>

        <button className="btn btn-warning w-100 mt-3" onClick={handleRoleUpgrade}>
          Upgrade to Organizer
        </button>

        <ul className="list-group mt-4">
          <li className={`list-group-item d-flex justify-content-between align-items-center ${selected === "upcoming" ? "active" : ""}`}
              style={{ cursor: "pointer" }} onClick={() => setSelected("upcoming")}>
            Upcoming <span className="badge bg-primary rounded-pill">{upcoming.length}</span>
          </li>
          <li className={`list-group-item d-flex justify-content-between align-items-center ${selected === "past" ? "active" : ""}`}
              style={{ cursor: "pointer" }} onClick={() => setSelected("past")}>
            Past <span className="badge bg-secondary rounded-pill">{past.length}</span>
          </li>
          <li className={`list-group-item d-flex justify-content-between align-items-center ${selected === "cancelled" ? "active" : ""}`}
              style={{ cursor: "pointer" }} onClick={() => setSelected("cancelled")}>
            Cancelled <span className="badge bg-danger rounded-pill">{cancelled.length}</span>
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ width: "85%", padding: "2rem" }}>
        <h2>Attendee Dashboard</h2>
        <button className="btn btn-info mb-3" onClick={loadBookings}>Reload Bookings</button>
        {renderContent()}
      </div>
    </div>
  );
};

export default AttendeeDashboard;
