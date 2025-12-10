import { useEffect, useState } from "react";
import axios from "axios";
import EditEventModal from "../components/EditEventModal";
import CreateEventModal from "../components/CreateEventModal";
import AddTicketTypeModal from "../components/AddTicketTypeModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const OrganizerDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [showCreate, setShowCreate] = useState(false);

    const [showTicketType, setShowTicketType] = useState(false);
    const [eventForTicketType, setEventForTicketType] = useState(null);

    // =========================
    // Organizer from localStorage
    // =========================
    const [organizer, setOrganizer] = useState(null);

    useEffect(() => {
        const raw = localStorage.getItem("user");
        if (raw) {
            try {
                setOrganizer(JSON.parse(raw));
            } catch (e) {
                console.error("Invalid user JSON");
            }
        }
    }, []);

    // =========================
    // Reviews modal state
    // =========================
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedEventReviews, setSelectedEventReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState("");

    const axiosAuth = axios.create({
        baseURL: BASE_URL.replace(/\/+$/, ""),
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const handleCreate = (newEvent) => {
        const eventData = newEvent.event || newEvent;
        setEvents((prev) => [...prev, eventData]);
    };

    const loadMyEvents = async () => {
        try {
            setLoading(true);
            const res = await axiosAuth.get("/events/organizer/my-events");
            const list = res.data.events || res.data.data || res.data.data?.events || [];
            setEvents(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("❌ Error loading events", err);
            setError("Failed to load your events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMyEvents();
    }, []);

    const handleSave = (updatedEvent) => {
        setEvents((prev) =>
            prev.map((ev) =>
                ev.id === updatedEvent.id ? { ...ev, ...updatedEvent } : ev
            )
        );
    };

    // =========================
    // Load reviews for a particular event
    // GET /api/reviews/event/:eventId
    // =========================
    const loadEventReviews = async (eventId) => {
        try {
            setSelectedEventReviews([]);
            setReviewsError("");
            setReviewsLoading(true);

            // route requires JWT; organizer is authenticated
            const res = await axiosAuth.get(`/reviews/event/${eventId}`);
            const reviews = res.data.data || res.data.reviews || [];
            setSelectedEventReviews(Array.isArray(reviews) ? reviews : []);
            setShowReviewsModal(true);
        } catch (err) {
            console.error("Failed to load reviews", err);
            setReviewsError("Failed to load reviews for this event");
            setShowReviewsModal(true);
        } finally {
            setReviewsLoading(false);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Organizer Dashboard</h2>

            {/* Organizer Info */}
            <p>
                <strong>Welcome:</strong> {organizer?.name || "Organizer"}
            </p>
            <p style={{ marginTop: "-10px", color: "#666" }}>
                {organizer?.email}
            </p>

            <div className="d-flex justify-content-between mt-3">
                <h4>Your Events</h4>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    + Create New Event
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}

            <table className="table mt-3 table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Date/Time</th>
                        <th>Location</th>
                        <th>Category</th>
                        <th>Capacity</th>
                        <th>Ticket Types</th>
                        <th>Allocated</th>
                        <th>Attendees</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {events.map((ev) => {
                        const ticketTypes = ev.ticketTypes ?? [];
                        const allocated = ticketTypes.reduce(
                            (sum, t) => sum + Number(t.limit || 0),
                            0
                        );

                        return (
                            <tr key={ev.id}>
                                <td>{ev.id}</td>
                                <td>{ev.title}</td>
                                <td>{new Date(ev.dateTime).toLocaleString()}</td>
                                <td>{ev.location}</td>
                                <td>{ev.category}</td>
                                <td>{ev.capacity}</td>

                                <td>
                                    {ticketTypes.length === 0 ? (
                                        <span className="text-muted">None</span>
                                    ) : (
                                        ticketTypes.map((t) => (
                                            <div key={t.id}>
                                                {String(t.type).toUpperCase()} ({t.limit})
                                            </div>
                                        ))
                                    )}
                                </td>

                                <td>{allocated} / {ev.capacity}</td>

                                <td>
                                    {
                                        (ev.bookings ?? [])
                                            .filter((b) => b.status !== "cancelled")   // ignore cancelled
                                            .reduce((sum, b) => sum + (Number(b.quantity) || 0), 0)
                                    }

                                    <button
                                        className="btn btn-sm btn-outline-info ms-2"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#attendees-${ev.id}`}
                                    >
                                        View
                                    </button>
                                </td>


                                <td className="d-flex gap-2">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => {
                                            setSelectedEvent(ev);
                                            setShowModal(true);
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => {
                                            setEventForTicketType(ev);
                                            setShowTicketType(true);
                                        }}
                                    >
                                        Add Ticket Type
                                    </button>

                                    {/* NEW: View Reviews button */}
                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => loadEventReviews(ev.id)}
                                    >
                                        View Reviews
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* ================================
                Attendee Table (View Collapse)
            ================================ */}
            {events.map((ev) => (
                <div key={ev.id} className="collapse mt-2" id={`attendees-${ev.id}`}>
                    <h5>Attendees for: {ev.title}</h5>

                    <table className="table table-sm table-bordered">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Ticket Type</th>
                                <th>Quantity</th>
                                <th>Total Cost</th>
                                <th>Status</th>
                                <th>Booked At</th>
                            </tr>
                        </thead>

                        <tbody>
                            {(ev.bookings ?? []).length === 0 ? (
                                <tr>
                                    <td colSpan="8">No attendees yet</td>
                                </tr>
                            ) : (
                                (ev.bookings ?? []).map((b) => (
                                    <tr key={b.id}>
                                        <td className={b.status === "cancelled" ? "text-danger" : ""}>{b.id}</td>
                                        <td className={b.status === "cancelled" ? "text-danger" : ""}>{b.user?.name}</td>
                                        <td className={b.status === "cancelled" ? "text-danger" : ""}>{b.user?.email}</td>

                                        <td className={b.status === "cancelled" ? "text-danger" : ""}>{b.ticketType?.type || "N/A"}</td>
                                        <td className={b.status === "cancelled" ? "text-danger" : ""}>{b.quantity}</td>
                                        <td className={b.status === "cancelled" ? "text-danger" : ""}>₹{b.totalPrice}</td>

                                        <td className={b.status === "cancelled" ? "text-danger" : ""}>{b.status}</td>

                                        <td className={b.status === "cancelled" ? "text-danger" : ""}>
                                            {new Date(b.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ))}

            {/* Modals */}
            {showModal && selectedEvent && (
                <EditEventModal
                    show={showModal}
                    event={selectedEvent}
                    onClose={() => setShowModal(false)}
                    onSave={(updated) => {
                        handleSave(updated);
                        setShowModal(false);
                    }}
                />
            )}

            {showCreate && (
                <CreateEventModal
                    show={showCreate}
                    onClose={() => setShowCreate(false)}
                    onCreate={handleCreate}
                />
            )}

            {showTicketType && eventForTicketType && (
                <AddTicketTypeModal
                    show={showTicketType}
                    event={eventForTicketType}
                    onClose={() => setShowTicketType(false)}
                    onSuccess={(newType) => {
                        setEvents((prev) =>
                            prev.map((ev) =>
                                ev.id === eventForTicketType.id
                                    ? {
                                          ...ev,
                                          ticketTypes: [...(ev.ticketTypes ?? []), newType],
                                      }
                                    : ev
                            )
                        );
                        setShowTicketType(false);
                    }}
                />
            )}

            {/* ===========================================
                REVIEWS MODAL
            =========================================== */}
            {showReviewsModal && (
                <div className="modal-backdrop d-flex justify-content-center align-items-center"
                     style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" }}>
                    <div className="card p-3" style={{ minWidth: 600, maxHeight: "80vh", overflowY: "auto" }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5>Event Reviews</h5>
                            <button className="btn-close" onClick={() => setShowReviewsModal(false)} />
                        </div>

                        {reviewsLoading && <p>Loading reviews…</p>}
                        {reviewsError && <p className="text-danger">{reviewsError}</p>}

                        {!reviewsLoading && !reviewsError && selectedEventReviews.length === 0 && (
                            <p className="mt-3">No reviews yet for this event.</p>
                        )}

                        {!reviewsLoading && selectedEventReviews.length > 0 && (
                            <table className="table table-bordered mt-3 mb-0">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>User</th>
                                        <th>Rating</th>
                                        <th>Review</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedEventReviews.map((r, i) => (
                                        <tr key={r.id}>
                                            <td>{i + 1}</td>
                                            <td>{r.user?.name || r.user?.email || "User"}</td>
                                            <td>{r.rating}</td>
                                            <td>{r.reviewText || "—"}</td>
                                            <td>{new Date(r.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div className="mt-3 text-end">
                            <button className="btn btn-secondary" onClick={() => setShowReviewsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizerDashboard;
