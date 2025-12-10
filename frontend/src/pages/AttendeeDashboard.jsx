import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL; // e.g. "http://localhost:5000/api/"

const AttendeeDashboard = () => {
  // ===========================================
  // USER FROM LOCAL STORAGE
  // ===========================================
  const [attendee, setAttendee] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setAttendee(JSON.parse(raw));
    } catch {
      console.error("Invalid user JSON");
    }
  }, []);

  // ===========================================
  // DASHBOARD STATE
  // ===========================================
  const [selected, setSelected] = useState("upcoming");
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [myReports, setMyReports] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===========================================
  // MODALS
  // ===========================================
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // ===========================================
  // AUTH AXIOS INSTANCE (use baseURL so calls are consistent)
  // ===========================================
  const axiosAuth = axios.create({
    baseURL: BASE_URL.replace(/\/+$/, "") + "/", // ensures trailing slash
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // ===========================================
  // LOAD BOOKINGS
  // ===========================================
  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosAuth.get("users/bookings");

      const bookings =
        res.data.bookings || res.data.data?.bookings || res.data.data || [];

      const now = new Date();
      const upcomingArr = [];
      const pastArr = [];
      const cancelledArr = [];

      bookings.forEach((b) => {
        const eventDate = new Date(b.event?.dateTime);
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
      console.error(err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // ===========================================
  // LOAD MY REVIEWS
  // Called only when user opens "My Reviews" tab
  // ===========================================
  const loadMyReviews = async () => {
    try {
      const res = await axiosAuth.get("reviews/"); // GET /api/reviews/
      setMyReviews(res.data.data || res.data.reviews || res.data || []);
    } catch (err) {
      console.error("Failed loading reviews", err);
      setMyReviews([]); // reset on error
    }
  };

  // ===========================================
  // LOAD MY REPORTS
  // Note: backend must expose GET /api/reports/user or similar for this to work
  // If you don't have it, this will fail gracefully and leave myReports empty
  // ===========================================
  const loadMyReports = async () => {
    try {
      const res = await axiosAuth.get("reports/user"); // GET /api/reports/user
      setMyReports(res.data.data || res.data.reports || res.data || []);
    } catch (err) {
      console.error("Failed loading reports", err);
      setMyReports([]); // reset on error
    }
  };

  // ===========================================
  // WHEN USER SWITCHES TABS: fetch reviews/reports ONCE
  // ===========================================
  useEffect(() => {
    if (selected === "myreviews") {
      loadMyReviews();
    }
    if (selected === "myreports") {
      loadMyReports();
    }
  }, [selected]);

  // ===========================================
  // UPGRADE ROLE
  // ===========================================
  const handleRoleUpgrade = async () => {
    try {
      await axiosAuth.post("users/request");
      alert("Organizer role request submitted!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit request");
    }
  };

  // ===========================================
  // OPEN MODALS
  // ===========================================
  const openReviewModal = (b) => {
    setSelectedBooking(b);
    setShowReviewModal(true);
  };

  const openReportModal = (b) => {
    setSelectedBooking(b);
    setShowReportModal(true);
  };

  // ===========================================
  // BOOKING TABLE
  // ===========================================
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
            <th>Ticket</th>
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
            <tr><td colSpan="12" className="text-center">No records</td></tr>
          ) : (
            data.map((b, i) => (
              <tr key={b.id}>
                <td>{i + 1}</td>
                <td>{b.event?.title}</td>
                <td>{new Date(b.event?.dateTime).toLocaleString()}</td>
                <td>{b.event?.location}</td>
                <td>{b.event?.category}</td>
                <td>{b.ticketType?.type}</td>
                <td>₹{b.ticketType?.price}</td>
                <td>{b.quantity}</td>
                <td>₹{b.totalPrice}</td>
                <td>{new Date(b.createdAt).toLocaleString()}</td>

                <td className={b.status === "cancelled" ? "text-danger" : "text-success"}>
                  {b.status}
                </td>

                <td>
                  {/* CANCEL ONLY FOR UPCOMING */}
                  {title === "Upcoming Events" && (
                    <button
                      className="btn btn-sm btn-danger me-2"
                      onClick={async () => {
                        if (!confirm("Cancel this booking?")) return;
                        try {
                          await axiosAuth.put(`bookings/${b.id}/cancel`);
                          await reloadBookings();
                        } catch (err) {
                          console.error(err);
                          alert("Failed to cancel");
                        }
                      }}
                    >
                      Cancel
                    </button>
                  )}

                  {/* REVIEW / REPORT FOR PAST EVENTS */}
                  {title === "Past Events" && (
                    <>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => openReviewModal(b)}
                      >
                        Review
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => openReportModal(b)}
                      >
                        Report
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // ===========================================
  // RENDER TAB CONTENT
  // (No fetch calls here - fetches are handled via useEffect)
  // ===========================================
  const renderContent = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    if (selected === "upcoming") return <BookingTable title="Upcoming Events" data={upcoming} reloadBookings={loadBookings} />;
    if (selected === "past") return <BookingTable title="Past Events" data={past} reloadBookings={loadBookings} />;
    if (selected === "cancelled") return <BookingTable title="Cancelled Bookings" data={cancelled} reloadBookings={loadBookings} />;

    if (selected === "myreviews") {
      return (
        <div>
          <h3>My Reviews</h3>
          {myReviews.length === 0 ? (
            <p>No reviews yet</p>
          ) : (
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Event</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {myReviews.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>{r.event?.title}</td>
                    <td>{r.rating}</td>
                    <td>{r.reviewText}</td>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    }

    if (selected === "myreports") {
      return (
        <div>
          <h3>My Reports</h3>
          {myReports.length === 0 ? (
            <p>No reports filed</p>
          ) : (
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Event</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {myReports.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>{r.event?.title}</td>
                    <td>{r.reason}</td>
                    <td>{r.status}</td>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    }
  };

  // ===========================================
  // RENDER
  // ===========================================
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
        <p><strong>Welcome: {attendee?.name}</strong></p>
        <p style={{ marginTop: "-10px", color: "#666" }}>{attendee?.email}</p>

        <button className="btn btn-warning w-100 mt-3" onClick={handleRoleUpgrade}>
          Upgrade to Organizer
        </button>

        <ul className="list-group mt-4">
          <li className={`list-group-item ${selected === "upcoming" ? "active" : ""}`} onClick={() => setSelected("upcoming")}>
            Upcoming
          </li>

          <li className={`list-group-item ${selected === "past" ? "active" : ""}`} onClick={() => setSelected("past")}>
            Past
          </li>

          <li className={`list-group-item ${selected === "cancelled" ? "active" : ""}`} onClick={() => setSelected("cancelled")}>
            Cancelled
          </li>

          <li className={`list-group-item ${selected === "myreviews" ? "active" : ""}`} onClick={() => setSelected("myreviews")}>
            My Reviews
          </li>

          <li className={`list-group-item ${selected === "myreports" ? "active" : ""}`} onClick={() => setSelected("myreports")}>
            My Reports
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ width: "85%", padding: "2rem" }}>
        {renderContent()}
      </div>

      {/* ===========================================
          REVIEW MODAL
          (submit calls loadMyReviews() once on success)
      =========================================== */}
      {showReviewModal && selectedBooking && (
        <div className="modal-backdrop d-flex justify-content-center align-items-center"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" }}>
          <div className="card p-4" style={{ minWidth: "400px" }}>
            <h4>Review: {selectedBooking.event.title}</h4>

            <label className="mt-3">Rating (1–5)</label>
            <input id="reviewRating" type="number" min="1" max="5" className="form-control" />

            <label className="mt-3">Review</label>
            <textarea id="reviewText" className="form-control" />

            <div className="mt-3 d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>Close</button>

              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    const rating = Number(document.getElementById("reviewRating").value);
                    const reviewText = document.getElementById("reviewText").value;

                    // POST to /api/reviews/
                    await axiosAuth.post("reviews/", {
                      eventId: selectedBooking.event.id,
                      rating,
                      reviewText,
                    });

                    // reload reviews once if viewing that tab
                    if (selected === "myreviews") await loadMyReviews();

                    // Optionally reload bookings (if your UI depends on it)
                    await loadBookings();

                    alert("Review submitted!");
                    setShowReviewModal(false);
                  } catch (err) {
                    console.error(err);
                    alert(err.response?.data?.message || "Failed to submit review");
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===========================================
          REPORT MODAL
          (submit calls loadMyReports() once on success)
      =========================================== */}
      {showReportModal && selectedBooking && (
        <div className="modal-backdrop d-flex justify-content-center align-items-center"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" }}>
          <div className="card p-4" style={{ minWidth: "400px" }}>
            <h4>Report: {selectedBooking.event.title}</h4>

            <label className="mt-3">Reason</label>
            <textarea id="reportReason" className="form-control" />

            <div className="mt-3 d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Close</button>

              <button
                className="btn btn-warning"
                onClick={async () => {
                  try {
                    const reason = document.getElementById("reportReason").value;

                    // POST to /api/reports/event/:eventId
                    await axiosAuth.post(`reports/event/${selectedBooking.event.id}`, { reason });

                    // reload my reports once if viewing that tab
                    if (selected === "myreports") await loadMyReports();

                    alert("Report submitted!");
                    setShowReportModal(false);
                  } catch (err) {
                    console.error(err);
                    alert(err.response?.data?.message || "Failed to submit report");
                  }
                }}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AttendeeDashboard;
