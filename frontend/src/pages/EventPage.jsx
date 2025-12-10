import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BookTicketModal from "../components/BookTicketModal";

const EventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const BASE_URL = trimTrailingSlash(import.meta.env.VITE_BASE_URL || "");

  function trimTrailingSlash(s) {
    return s ? s.replace(/\/+$/, "") : "";
  }

  // ===============================
  // FETCH EVENT DETAILS
  // ===============================
  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/events/${id}`);
      const json = await res.json();

      if (!json.success) {
        setError("Failed to load event");
        return;
      }

      setEvent(json.data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // FETCH REVIEWS (PUBLIC)
  // ===============================
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/reviews/event/${id}`);
      const json = await res.json();
      setReviews(json.data || []);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchReviews();
  }, [id]);

  // ===============================
  // CHECK LOGIN + ROLE BEFORE BOOKING
  // ===============================
  const handleBookClick = () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== "attendee") {
      alert("Only attendees can book tickets.");
      return;
    }

    setShowModal(true);
  };

  // ===============================
  // COMPUTE AVERAGE RATING
  // ===============================
  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      ).toFixed(1)
    : null;

  // STAR RENDERING
  const renderStars = (rating) => {
    if (!rating) return "No ratings yet";

    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    return (
      <>
        <span style={{ color: "#FFD700", fontSize: "1.3rem" }}>
          {"★".repeat(full)}
          {half ? "☆" : ""}
          {"✩".repeat(empty)}
        </span>
      </>
    );
  };

  if (loading)
    return <div className="text-center mt-5">Loading event...</div>;
  if (error)
    return <div className="text-center text-danger mt-5">{error}</div>;

  return (
    <div className="container my-5">
      <div className="card shadow-lg p-4">
        <img
          src={`${event.bannerImage}`}
          alt={event.title}
          className="img-fluid rounded mb-4"
          style={{ maxHeight: "400px", objectFit: "cover" }}
        />

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fw-bold">{event.title}</h2>
          <span className="badge bg-primary">{event.category}</span>
        </div>

        {/* =======================
            AVERAGE RATING BLOCK
        ======================= */}
        <div className="mb-4 p-3 bg-light rounded border">
          <h5 className="mb-1">Average Rating</h5>

          {reviews.length === 0 ? (
            <p>No ratings yet</p>
          ) : (
            <div className="d-flex align-items-center" style={{ fontSize: "1.2rem" }}>
              {renderStars(averageRating)}
              <span className="ms-3">
                {averageRating} / 5 ({reviews.length}{" "}
                {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>

        <p className="text-muted">
          <strong>Date:</strong> {new Date(event.dateTime).toLocaleString()}
        </p>
        <p className="text-muted">
          <strong>Location:</strong> {event.location}
        </p>
        <p className="text-muted">
          <strong>Capacity:</strong> {event.capacity} participants
        </p>

        <p className="mt-4">{event.description}</p>

        <div className="mt-4 p-3 border rounded bg-light">
          <h5 className="mb-2">Organizer</h5>
          <p className="m-0">
            <strong>Name:</strong> {event.creator.name}
          </p>
          <p className="m-0">
            <strong>Email:</strong> {event.creator.email}
          </p>
        </div>

        {event.teaserVideo && (
          <div className="mt-4">
            <h5>Event Teaser</h5>
            <video
              src={`${BASE_URL}/${event.teaserVideo}`}
              controls
              className="w-100 rounded"
            />
          </div>
        )}

        <div className="d-flex justify-content-end mt-4">
          <button
            className="btn btn-success btn-lg px-4"
            onClick={handleBookClick}
          >
            Book Now
          </button>
        </div>

        {showModal && (
          <BookTicketModal
            event={event}
            onClose={() => setShowModal(false)}
            refreshEvent={fetchEvent}
          />
        )}

        {/* =======================
            PUBLIC REVIEW LIST
        ======================= */}
        <hr className="my-4" />
        <h3 className="mb-3">Event Reviews</h3>

        {reviewsLoading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet</p>
        ) : (
          <div className="mt-3">
            {reviews.map((r) => (
              <div key={r.id} className="p-3 border rounded mb-3">
                <strong>{r.user?.name}</strong>
                <div className="text-warning" style={{ fontSize: "1rem" }}>
                  {renderStars(r.rating)}
                </div>
                <p className="mt-2">{r.reviewText}</p>
                <small className="text-muted">
                  {new Date(r.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPage;
