// src/pages/AttendeeDashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL; // should end with '/api/' or similar

const AttendeeDashboard = () => {
  const [attendee, setAttendee] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setAttendee(JSON.parse(raw));
    } catch {
      console.error("Invalid user JSON");
    }
  }, []);

  const [selected, setSelected] = useState("upcoming");
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [cancelled, setCancelled] = useState([]);

  const [myReviews, setMyReviews] = useState([]);
  const [myReports, setMyReports] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Review form state (controlled)
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null); // if editing existing review

  const [reportReason, setReportReason] = useState("");
  const [editingReportId, setEditingReportId] = useState(null);

  const axiosAuth = axios.create({
    baseURL: (BASE_URL || "").replace(/\/+$/, "") + "/",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  // Load bookings
  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosAuth.get("users/bookings");
      const bookings = res.data.bookings || res.data.data?.bookings || res.data.data || [];

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
    // load my reviews & reports once
    loadMyReviews();
    loadMyReports();
  }, []);

  // Load my reviews
  const loadMyReviews = async () => {
    try {
      const res = await axiosAuth.get("reviews/");
      setMyReviews(res.data.data || res.data.reviews || res.data || []);
    } catch (err) {
      console.error("Failed loading reviews", err);
      setMyReviews([]);
    }
  };

  // Load my reports
  const loadMyReports = async () => {
    try {
      const res = await axiosAuth.get("reports/user");
      setMyReports(res.data.data || res.data.reports || res.data || []);
    } catch (err) {
      console.error("Failed loading reports", err);
      setMyReports([]);
    }
  };

  // Role upgrade
  const handleRoleUpgrade = async () => {
    try {
      await axiosAuth.post("users/request");
      alert("Organizer role request submitted!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit request");
    }
  };

  // Open review modal: prefill if user already reviewed that event
  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    // find existing review (from myReviews) for the event
    const existing = myReviews.find((r) => r.eventId === booking.event.id || r.event?.id === booking.event.id);
    if (existing) {
      setEditingReviewId(existing.id);
      setReviewRating(Number(existing.rating) || 5);
      setReviewText(existing.reviewText || "");
    } else {
      setEditingReviewId(null);
      setReviewRating(5);
      setReviewText("");
    }
    setShowReviewModal(true);
  };

  // Open report modal: prefill if user already reported
  const openReportModal = (booking) => {
    setSelectedBooking(booking);
    const existing = myReports.find((r) => r.eventId === booking.event.id || r.event?.id === booking.event.id);
    if (existing) {
      setEditingReportId(existing.id);
      setReportReason(existing.reason || "");
    } else {
      setEditingReportId(null);
      setReportReason("");
    }
    setShowReportModal(true);
  };

  // Helper: check if already reviewed
  const hasReviewed = (eventId) => {
    return myReviews.some((r) => r.eventId === eventId || r.event?.id === eventId);
  };

  // Helper: check if already reported
  const hasReported = (eventId) => {
    return myReports.some((r) => r.eventId === eventId || r.event?.id === eventId);
  };

  // Submit review (upsert)
  const submitReview = async () => {
    try {
      if (!selectedBooking) return;
      const payload = {
        eventId: selectedBooking.event.id,
        rating: Number(reviewRating),
        reviewText,
      };

      await axiosAuth.post("reviews/", payload); // backend does upsert

      // reload both myReviews and bookings to reflect state
      await loadMyReviews();
      await loadBookings();

      alert("Review submitted/updated.");
      setShowReviewModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit review");
    }
  };

  // Delete review
  const deleteReview = async (reviewId) => {
    if (!confirm("Delete this review?")) return;
    try {
      await axiosAuth.delete(`reviews/${reviewId}`);
      await loadMyReviews();
      alert("Review deleted.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete review");
    }
  };

  // Submit report (upsert)
  const submitReport = async () => {
    try {
      if (!selectedBooking) return;
      const eventId = selectedBooking.event.id;
      await axiosAuth.post(`reports/event/${eventId}`, { reason: reportReason });

      await loadMyReports();
      alert("Report submitted/updated.");
      setShowReportModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit report");
    }
  };

  // Booking table component
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
                <td className={b.status === "cancelled" ? "text-danger" : "text-success"}>{b.status}</td>
                <td>
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

                  {title === "Past Events" && (
                    <>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => openReviewModal(b)}
                        disabled={hasReviewed(b.event.id)}
                        title={hasReviewed(b.event.id) ? "You already reviewed this event" : "Leave/Edit review"}
                      >
                        {hasReviewed(b.event.id) ? "Reviewed" : "Review"}
                      </button>

                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => openReportModal(b)}
                        disabled={hasReported(b.event.id)}
                        title={hasReported(b.event.id) ? "You already reported this event" : "Report event"}
                      >
                        {hasReported(b.event.id) ? "Reported" : "Report"}
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

  // Render main content
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
                  <th>Action</th>
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
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          // open modal to edit this review
                          setSelectedBooking({ event: r.event });
                          setEditingReviewId(r.id);
                          setReviewRating(r.rating);
                          setReviewText(r.reviewText || "");
                          setShowReviewModal(true);
                        }}
                      >
                        Edit
                      </button>

                      <button className="btn btn-sm btn-danger" onClick={() => deleteReview(r.id)}>
                        Delete
                      </button>
                    </td>
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

  return (
    <div className="d-flex" style={{ width: "100%" }}>
      {/* Sidebar */}
      <div style={{ width: "15%", minHeight: "100vh", background: "#f7f7f7", padding: "1rem", borderRight: "1px solid #ddd" }}>
        <h4>Attendee Menu</h4>
        <p><strong>Welcome: {attendee?.name}</strong></p>
        <p style={{ marginTop: "-10px", color: "#666" }}>{attendee?.email}</p>

        <button className="btn btn-warning w-100 mt-3" onClick={handleRoleUpgrade}>Upgrade to Organizer</button>

        <ul className="list-group mt-4">
          <li className={`list-group-item ${selected === "upcoming" ? "active" : ""}`} onClick={() => setSelected("upcoming")}>Upcoming</li>
          <li className={`list-group-item ${selected === "past" ? "active" : ""}`} onClick={() => setSelected("past")}>Past</li>
          <li className={`list-group-item ${selected === "cancelled" ? "active" : ""}`} onClick={() => setSelected("cancelled")}>Cancelled</li>
          <li className={`list-group-item ${selected === "myreviews" ? "active" : ""}`} onClick={() => setSelected("myreviews")}>My Reviews</li>
          <li className={`list-group-item ${selected === "myreports" ? "active" : ""}`} onClick={() => setSelected("myreports")}>My Reports</li>
        </ul>
      </div>

      {/* Main */}
      <div style={{ width: "85%", padding: "2rem" }}>
        <h2>Attendee Dashboard</h2>
        <button className="btn btn-info mb-3" onClick={() => { loadBookings(); loadMyReviews(); loadMyReports(); }}>Reload Bookings</button>
        {renderContent()}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="modal-backdrop d-flex justify-content-center align-items-center" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" }}>
          <div className="card p-4" style={{ minWidth: "400px" }}>
            <h4>Review: {selectedBooking.event.title}</h4>

            <label className="mt-3">Rating (1–5)</label>
            <input
              type="number"
              min="1"
              max="5"
              className="form-control"
              value={reviewRating}
              onChange={(e) => setReviewRating(Number(e.target.value))}
            />

            <label className="mt-3">Review</label>
            <textarea className="form-control" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />

            <div className="mt-3 d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>Close</button>
              <button className="btn btn-primary" onClick={submitReview}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && selectedBooking && (
        <div className="modal-backdrop d-flex justify-content-center align-items-center" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" }}>
          <div className="card p-4" style={{ minWidth: "400px" }}>
            <h4>Report: {selectedBooking.event.title}</h4>

            <label className="mt-3">Reason</label>
            <textarea className="form-control" value={reportReason} onChange={(e) => setReportReason(e.target.value)} />

            <div className="mt-3 d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Close</button>
              <button className="btn btn-warning" onClick={submitReport}>Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendeeDashboard;
