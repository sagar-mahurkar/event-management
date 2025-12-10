import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AttendeeDashboard = () => {
  // ================================
  // Load Attendee From LocalStorage
  // ================================
  const [attendee, setAttendee] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setAttendee(JSON.parse(raw));
      } catch (e) {
        console.error("❌ Invalid user JSON in localStorage");
      }
    }
  }, []);

  const [selected, setSelected] = useState("upcoming");
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const axiosAuth = axios.create({
    baseURL: `${BASE_URL.replace(/\/+$/, "")}/users`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // ================================
  // Load Bookings
  // ================================
  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosAuth.get("/bookings");

      const list =
        res.data.bookings ||
        res.data.data?.bookings ||
        res.data.data ||
        [];

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

  // ================================
  // Upgrade Role Request
  // ================================
  const handleRoleUpgrade = async () => {
    try {
      await axiosAuth.post("/request");
      alert("Organizer role request submitted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit request");
    }
  };

  // ================================
  // Booking Table Component
  // ================================
  const BookingTable = ({ title, data, reloadBookings }) => (
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
            <th>Ticket Type</th>
            <th>Rate</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Booked At</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan="12" className="text-center">No records found</td></tr>
          ) : (
            data.map((b, i) => (
              <tr key={b.id}>
                <td>{i + 1}</td>
                <td>{b.event?.title}</td>
                <td>{new Date(b.event?.dateTime).toLocaleString()}</td>
                <td>{b.event?.location}</td>
                <td>{b.event?.category}</td>
                <td>{b.ticketType}</td>
                <td>₹{b.rate}</td>
                <td>{b.quantity}</td>
                <td>₹{b.quantity * b.rate}</td>
                <td>{new Date(b.createdAt).toLocaleString()}</td>
                <td className={b.status === "cancelled" ? "text-danger" : "text-success"}>
                  {b.status}
                </td>

                <td>
                  {b.status !== "cancelled" ? (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={async () => {
                        if (!confirm("Cancel this booking?")) return;

                        try {
                          await axios.put(
                            `${BASE_URL.replace(/\/+$/, "")}/users/bookings/${b.id}/cancel`,
                            {},
                            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                          );
                          alert("Booking cancelled.");
                          reloadBookings();
                        } catch (err) {
                          alert("Failed to cancel booking");
                        }
                      }}
                    >Cancel</button>
                  ) : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    if (selected === "upcoming") return <BookingTable title="Upcoming Events" data={upcoming} reloadBookings={loadBookings} />;
    if (selected === "past") return <BookingTable title="Past Events" data={past} reloadBookings={loadBookings} />;
    if (selected === "cancelled") return <BookingTable title="Cancelled Bookings" data={cancelled} reloadBookings={loadBookings} />;
  };

  return (
    <div className="d-flex" style={{ width: "100%" }}>

      {/* Sidebar */}
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

        {/* Show attendee name in sidebar ONLY */}
        <p><strong>Welcome: {attendee?.name}</strong></p>
        <p style={{ marginTop: "-10px", color: "#666" }}>{attendee?.email}</p>

        <button className="btn btn-warning w-100 mt-3" onClick={handleRoleUpgrade}>
          Upgrade to Organizer
        </button>

        <ul className="list-group mt-4">
          <li
            className={`list-group-item d-flex justify-content-between ${selected === "upcoming" ? "active" : ""}`}
            onClick={() => setSelected("upcoming")}
          >
            Upcoming <span className="badge bg-primary rounded-pill">{upcoming.length}</span>
          </li>

          <li
            className={`list-group-item d-flex justify-content-between ${selected === "past" ? "active" : ""}`}
            onClick={() => setSelected("past")}
          >
            Past <span className="badge bg-secondary rounded-pill">{past.length}</span>
          </li>

          <li
            className={`list-group-item d-flex justify-content-between ${selected === "cancelled" ? "active" : ""}`}
            onClick={() => setSelected("cancelled")}
          >
            Cancelled <span className="badge bg-danger rounded-pill">{cancelled.length}</span>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ width: "85%", padding: "2rem" }}>
        <h2>Attendee Dashboard</h2>

        <button className="btn btn-info mb-3" onClick={loadBookings}>
          Reload Bookings
        </button>

        {renderContent()}
      </div>
    </div>
  );
};

export default AttendeeDashboard;
