// src/pages/AttendeeDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/+$/, "") + "/";

const AttendeeDashboard = () => {
  // ======================================================
  // USER PROFILE STATE
  // ======================================================
  const [attendee, setAttendee] = useState(null);

  // Whether the user has a pending organizer request (set optimistic after successful POST)
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  // axios instance that attaches token automatically
  const axiosAuth = useMemo(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    // (Optional) request interceptor to keep headers fresh if token changes
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return instance;
  }, []);

  // Fetch profile (and persist it locally)
  const loadProfile = async () => {
    try {
      const res = await axiosAuth.get("users/profile");
      // Many backends return profile under res.data.profile
      const profile = (res?.data && (res.data.profile || res.data.data || res.data)) || null;
      if (profile) {
        setAttendee(profile);
        localStorage.setItem("user", JSON.stringify(profile));
      } else {
        console.warn("Unexpected profile shape:", res?.data);
      }
    } catch (err) {
      console.error("Failed loading profile:", extractAxiosError(err));
    }
  };

  useEffect(() => {
    loadProfile();
  }, []); // on mount

  // ======================================================
  // PROFILE MODAL STATE
  // ======================================================
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  const openProfileModal = () => {
    setProfileName(attendee?.name || "");
    setProfileEmail(attendee?.email || "");
    setShowProfileModal(true);
  };

  const saveProfile = async () => {
    try {
      const body = { name: profileName, email: profileEmail };
      const res = await axiosAuth.put("users/profile", body);
      const updated = (res?.data && (res.data.profile || res.data.data || res.data)) || null;

      if (updated) {
        localStorage.setItem("user", JSON.stringify(updated));
        setAttendee(updated);
        alert("Profile updated successfully!");
        setShowProfileModal(false);
      } else {
        console.warn("Profile update returned unexpected shape:", res?.data);
        alert("Profile updated (unexpected response shape).");
      }
    } catch (err) {
      const msg = extractAxiosError(err) || "Failed to update profile";
      console.error("saveProfile error:", err.response?.data ?? err);
      alert(msg);
    }
  };

  // ======================================================
  // DASHBOARD STATE
  // ======================================================
  const [selected, setSelected] = useState("upcoming");
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [myReports, setMyReports] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // REVIEW & REPORT MODALS
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);

  const [reportReason, setReportReason] = useState("");
  const [editingReportId, setEditingReportId] = useState(null);

  // ======================================================
  // LOAD BOOKINGS / REVIEWS / REPORTS
  // ======================================================
  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosAuth.get("users/bookings");
      const bookings =
        res?.data?.bookings ||
        res?.data?.data?.bookings ||
        res?.data?.data ||
        res?.data ||
        [];

      // Normalize to array
      const rows = Array.isArray(bookings) ? bookings : [];

      const now = new Date();
      const upcomingArr = [];
      const pastArr = [];
      const cancelledArr = [];

      rows.forEach((b) => {
        const eventDate = new Date(b?.event?.dateTime);
        if (b?.status === "cancelled") cancelledArr.push(b);
        else if (eventDate && eventDate > now) upcomingArr.push(b);
        else pastArr.push(b);
      });

      upcomingArr.sort((a, b) => new Date(a.event.dateTime) - new Date(b.event.dateTime));
      pastArr.sort((a, b) => new Date(b.event.dateTime) - new Date(a.event.dateTime));

      setUpcoming(upcomingArr);
      setPast(pastArr);
      setCancelled(cancelledArr);
    } catch (err) {
      console.error("loadBookings error:", extractAxiosError(err));
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const loadMyReviews = async () => {
    try {
      const res = await axiosAuth.get("reviews/");
      const data = res?.data?.data || res?.data?.reviews || res?.data || [];
      setMyReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("loadMyReviews error:", extractAxiosError(err));
      setMyReviews([]);
    }
  };

  const loadMyReports = async () => {
    try {
      const res = await axiosAuth.get("reports/user");
      const data = res?.data?.data || res?.data?.reports || res?.data || [];
      setMyReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("loadMyReports error:", extractAxiosError(err));
      setMyReports([]);
    }
  };

  useEffect(() => {
    loadBookings();
    loadMyReviews();
    loadMyReports();
  }, []); // mount only

  // ======================================================
  // ROLE UPGRADE
  // ======================================================
  // We disable the Upgrade button if the user already has organizer role or we set hasPendingRequest after posting successfully.
  const handleRoleUpgrade = async () => {
    if (!attendee) {
      alert("Please load your profile first.");
      return;
    }

    if (attendee.role && attendee.role.toLowerCase() === "organizer") {
      alert("You are already an organizer.");
      return;
    }

    try {
      const res = await axiosAuth.post("users/request", {
        message: "Requesting upgrade to Organizer role.",
      });

      // success
      setHasPendingRequest(true);
      // If backend returns the created request, you can show it / store it if needed.
      alert("Organizer role request submitted!");
    } catch (err) {
      // Prefer backend-provided error text (`error` or `message`)
      const backendData = err?.response?.data;
      console.error("Organizer Upgrade Error:", backendData ?? err);

      const backendMessage =
        backendData?.error ||
        backendData?.message ||
        (typeof backendData === "string" ? backendData : null) ||
        "Failed to submit request";

      // If backend indicates user already has pending request, set the flag too
      if (
        backendMessage &&
        /pending organizer request/i.test(String(backendMessage))
      ) {
        setHasPendingRequest(true);
      }

      alert(backendMessage);
    }
  };

  // ======================================================
  // OPEN REVIEW / REPORT MODALS
  // ======================================================
  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    const existing = myReviews.find(
      (r) => r.eventId === booking.event.id || r.event?.id === booking.event.id
    );

    if (existing) {
      setEditingReviewId(existing.id);
      setReviewRating(existing.rating);
      setReviewText(existing.reviewText || "");
    } else {
      setEditingReviewId(null);
      setReviewRating(5);
      setReviewText("");
    }
    setShowReviewModal(true);
  };

  const openReportModal = (booking) => {
    setSelectedBooking(booking);

    const existing = myReports.find(
      (r) => r.eventId === booking.event.id || r.event?.id === booking.event.id
    );

    if (existing) {
      setEditingReportId(existing.id);
      setReportReason(existing.reason || "");
    } else {
      setEditingReportId(null);
      setReportReason("");
    }
    setShowReportModal(true);
  };

  const hasReviewed = (eventId) =>
    myReviews.some((r) => r.eventId === eventId || r.event?.id === eventId);

  const hasReported = (eventId) =>
    myReports.some((r) => r.eventId === eventId || r.event?.id === eventId);

  // ======================================================
  // SUBMIT REVIEW / REPORT
  // ======================================================
  const submitReview = async () => {
    if (!selectedBooking?.event?.id) {
      alert("No event selected");
      return;
    }
    try {
      const payload = {
        eventId: selectedBooking.event.id,
        rating: Number(reviewRating),
        reviewText,
      };

      await axiosAuth.post("reviews/", payload);
      await loadMyReviews();
      await loadBookings();
      alert("Review submitted/updated.");
      setShowReviewModal(false);
    } catch (err) {
      console.error("submitReview error:", extractAxiosError(err));
      alert(extractAxiosError(err) || "Failed to submit review");
    }
  };

  const deleteReview = async (reviewId) => {
    if (!confirm("Delete this review?")) return;

    try {
      await axiosAuth.delete(`reviews/${reviewId}`);
      await loadMyReviews();
      alert("Review deleted.");
    } catch (err) {
      console.error("deleteReview error:", extractAxiosError(err));
      alert("Failed to delete review");
    }
  };

  const submitReport = async () => {
    if (!selectedBooking?.event?.id) {
      alert("No event selected");
      return;
    }
    try {
      const eventId = selectedBooking.event.id;
      await axiosAuth.post(`reports/event/${eventId}`, { reason: reportReason });

      await loadMyReports();
      alert("Report submitted/updated.");
      setShowReportModal(false);
    } catch (err) {
      console.error("submitReport error:", extractAxiosError(err));
      alert(extractAxiosError(err) || "Failed to submit report");
    }
  };

  // ======================================================
  // BOOKING TABLE
  // ======================================================
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
            <tr>
              <td colSpan="12" className="text-center">
                No records
              </td>
            </tr>
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
                  {title === "Upcoming Events" && (
                    <button
                      className="btn btn-sm btn-danger me-2"
                      onClick={async () => {
                        if (!confirm("Cancel this booking?")) return;
                        try {
                          await axiosAuth.put(`bookings/${b.id}/cancel`);
                          await reloadBookings();
                        } catch (err) {
                          console.error("Cancel booking error:", extractAxiosError(err));
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
                      >
                        {hasReviewed(b.event.id) ? "Reviewed" : "Review"}
                      </button>

                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => openReportModal(b)}
                        disabled={hasReported(b.event.id)}
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

  // ======================================================
  // RENDER MAIN CONTENT
  // ======================================================
  const renderContent = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    if (selected === "upcoming")
      return <BookingTable title="Upcoming Events" data={upcoming} reloadBookings={loadBookings} />;
    if (selected === "past")
      return <BookingTable title="Past Events" data={past} reloadBookings={loadBookings} />;
    if (selected === "cancelled")
      return <BookingTable title="Cancelled Bookings" data={cancelled} reloadBookings={loadBookings} />;

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

  // ======================================================
  // FINAL JSX
  // ======================================================
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

        <p>
          <strong>Welcome: {attendee?.name}</strong>
        </p>
        <p style={{ marginTop: "-10px", color: "#666" }}>{attendee?.email}</p>

        <button className="btn btn-info w-100 mt-2" onClick={openProfileModal}>
          View / Edit Profile
        </button>

        <button
          className="btn btn-warning w-100 mt-3"
          onClick={handleRoleUpgrade}
          disabled={
            hasPendingRequest ||
            (attendee?.role && attendee.role.toLowerCase() === "organizer")
          }
          title={
            hasPendingRequest
              ? "You already have a pending organizer request"
              : attendee?.role && attendee.role.toLowerCase() === "organizer"
              ? "You are already an organizer"
              : "Request upgrade to Organizer"
          }
        >
          {attendee?.role && attendee.role.toLowerCase() === "organizer"
            ? "You're an Organizer"
            : hasPendingRequest
            ? "Pending Request"
            : "Upgrade to Organizer"}
        </button>

        <ul className="list-group mt-4">
          <li
            className={`list-group-item ${selected === "upcoming" ? "active" : ""}`}
            onClick={() => setSelected("upcoming")}
          >
            Upcoming
          </li>
          <li
            className={`list-group-item ${selected === "past" ? "active" : ""}`}
            onClick={() => setSelected("past")}
          >
            Past
          </li>
          <li
            className={`list-group-item ${selected === "cancelled" ? "active" : ""}`}
            onClick={() => setSelected("cancelled")}
          >
            Cancelled
          </li>
          <li
            className={`list-group-item ${selected === "myreviews" ? "active" : ""}`}
            onClick={() => setSelected("myreviews")}
          >
            My Reviews
          </li>
          <li
            className={`list-group-item ${selected === "myreports" ? "active" : ""}`}
            onClick={() => setSelected("myreports")}
          >
            My Reports
          </li>
        </ul>
      </div>

      {/* Main */}
      <div style={{ width: "85%", padding: "2rem" }}>
        <h2>Attendee Dashboard</h2>
        {renderContent()}
      </div>

      {/* ======================================================
          PROFILE MODAL
      ====================================================== */}
      {showProfileModal && (
        <div
          className="modal-backdrop d-flex justify-content-center align-items-center"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" }}
        >
          <div className="card p-4" style={{ minWidth: "450px" }}>
            <h4>Edit Profile</h4>

            <label className="mt-3">Name</label>
            <input className="form-control" value={profileName} onChange={(e) => setProfileName(e.target.value)} />

            <label className="mt-3">Email</label>
            <input className="form-control" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />

            <div className="mt-4 d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={saveProfile}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          REVIEW MODAL
      ====================================================== */}
      {showReviewModal && selectedBooking && (
        <div
          className="modal-backdrop d-flex justify-content-center align-items-center"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" }}
        >
          <div className="card p-4" style={{ minWidth: "400px" }}>
            <h4>Review: {selectedBooking.event.title}</h4>

            <label className="mt-3">Rating (1–5)</label>
            <input type="number" min="1" max="5" className="form-control" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} />

            <label className="mt-3">Review</label>
            <textarea className="form-control" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />

            <div className="mt-3 d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={submitReview}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          REPORT MODAL
      ====================================================== */}
      {showReportModal && selectedBooking && (
        <div
          className="modal-backdrop d-flex justify-content-center align-items-center"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" }}
        >
          <div className="card p-4" style={{ minWidth: "400px" }}>
            <h4>Report: {selectedBooking.event.title}</h4>

            <label className="mt-3">Reason</label>
            <textarea className="form-control" value={reportReason} onChange={(e) => setReportReason(e.target.value)} />

            <div className="mt-3 d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>
                Close
              </button>
              <button className="btn btn-warning" onClick={submitReport}>
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ======================================================
// Helper: extract a friendly message from Axios errors
// ======================================================
function extractAxiosError(err) {
  if (!err) return null;
  const backendData = err.response?.data;
  if (!backendData) {
    if (err.message) return err.message;
    return String(err);
  }

  // prefer common fields
  if (typeof backendData === "string") return backendData;
  if (backendData.error) return backendData.error;
  if (backendData.message) return backendData.message;
  // fallback: stringify small object
  try {
    return JSON.stringify(backendData);
  } catch {
    return String(backendData);
  }
}

export default AttendeeDashboard;
