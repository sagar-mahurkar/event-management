import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BookTicketModal from "../components/BookTicketModal";

const EventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const BASE_URL = trimTrailingSlash(import.meta.env.VITE_BASE_URL || "");

  function trimTrailingSlash(s) {
    return s ? s.replace(/\/+$/, "") : "";
  }

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

  useEffect(() => {
    fetchEvent();
  }, [id]);

  // 🔒 BOOK NOW: Check login + attendee role
  const handleBookClick = () => {
    const storedUser = localStorage.getItem("user");

    // Not logged in → redirect
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    // Logged in but not attendee → stop
    if (user.role !== "attendee") {
      alert("Only attendees can book tickets.");
      return;
    }

    // Logged in attendee → open modal
    setShowModal(true);
  };

  if (loading) return <div className="text-center mt-5">Loading event...</div>;
  if (error) return <div className="text-center text-danger mt-5">{error}</div>;

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
          <p className="m-0"><strong>Name:</strong> {event.creator.name}</p>
          <p className="m-0"><strong>Email:</strong> {event.creator.email}</p>
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
      </div>
    </div>
  );
};

export default EventPage;
