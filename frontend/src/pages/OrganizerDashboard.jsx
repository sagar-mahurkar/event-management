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
            console.error(err);
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
            prev.map((ev) => (ev.id === updatedEvent.id ? { ...ev, ...updatedEvent } : ev))
        );
    };

    const loadEventReviews = async (eventId) => {
        try {
            setReviewsLoading(true);
            setSelectedEventReviews([]);

            const res = await axiosAuth.get(`/reviews/event/${eventId}`);
            const list = res.data.data || [];

            setSelectedEventReviews(list);
            setShowReviewsModal(true);
        } catch (err) {
            setReviewsError("Failed to load reviews");
            setShowReviewsModal(true);
        } finally {
            setReviewsLoading(false);
        }
    };

    const deleteEvent = async (eventId) => {
        if (!confirm("Delete this event permanently?")) return;

        try {
            await axiosAuth.delete(`/events/${eventId}`);
            alert("Event deleted!");
            loadMyEvents();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete");
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Organizer Dashboard</h2>

            <p>
                <strong>Welcome:</strong> {organizer?.name}
            </p>
            <p style={{ marginTop: "-10px", color: "#666" }}>{organizer?.email}</p>

            <div className="d-flex justify-content-between mt-3">
                <h4>Your Events</h4>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    + Create New Event
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}

            <table className="table mt-3 table-bordered align-middle">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Date/Time</th>
                        <th>Location</th>
                        <th>Category</th>
                        <th>Capacity</th>

                        <th>Ticket Types</th>
                        <th>Limit</th>      {/* NEW COLUMN */}
                        <th>Prices</th>

                        <th>Allocated</th>
                        <th>Attendees</th>
                        <th style={{ width: "160px" }}>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {events.map((ev) => {
                        const types = ev.ticketTypes ?? [];
                        const allocated = types.reduce((sum, t) => sum + (t.limit || 0), 0);

                        return (
                            <tr key={ev.id}>
                                <td>{ev.id}</td>
                                <td>{ev.title}</td>
                                <td>{new Date(ev.dateTime).toLocaleString()}</td>
                                <td>{ev.location}</td>
                                <td>{ev.category}</td>
                                <td>{ev.capacity}</td>

                                {/* Ticket Types */}
                                <td>
                                    {types.length === 0
                                        ? "—"
                                        : types.map((t) => (
                                              <div key={t.id}>{t.type.toUpperCase()}</div>
                                          ))}
                                </td>

                                {/* NEW: Ticket Limits */}
                                <td>
                                    {types.length === 0
                                        ? "—"
                                        : types.map((t) => (
                                              <div key={t.id}>{t.limit}</div>
                                          ))}
                                </td>

                                {/* Ticket Prices */}
                                <td>
                                    {types.length === 0
                                        ? "—"
                                        : types.map((t) => (
                                              <div key={t.id}>₹{t.price}</div>
                                          ))}
                                </td>

                                <td>{allocated} / {ev.capacity}</td>

                                <td>
                                    {(ev.bookings ?? [])
                                        .filter((b) => b.status !== "cancelled")
                                        .reduce((sum, b) => sum + b.quantity, 0)}
                                    <button
                                        className="btn btn-sm btn-outline-info ms-2"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#attendees-${ev.id}`}
                                    >
                                        View
                                    </button>
                                </td>

                                {/* Actions */}
                                <td>
                                    <div className="d-flex gap-2">
                                        {/* Edit Event */}
                                        <button
                                            className="btn btn-light border btn-sm"
                                            title="Edit Event"
                                            onClick={() => {
                                                setSelectedEvent(ev);
                                                setShowModal(true);
                                            }}
                                        >
                                            ✏️
                                        </button>

                                        {/* Configure Ticket Types */}
                                        <button
                                            className="btn btn-light border btn-sm"
                                            title="Configure Ticket Types"
                                            onClick={() => {
                                                setEventForTicketType(ev);
                                                setShowTicketType(true);
                                            }}
                                        >
                                            🎫
                                        </button>

                                        {/* View Reviews */}
                                        <button
                                            className="btn btn-light border btn-sm"
                                            title="View Reviews"
                                            onClick={() => loadEventReviews(ev.id)}
                                        >
                                            ⭐
                                        </button>

                                        {/* Delete Event */}
                                        <button
                                            className="btn btn-light border btn-sm text-danger"
                                            title="Delete Event"
                                            onClick={() => deleteEvent(ev.id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Collapsible attendees */}
            {events.map((ev) => (
                <div key={ev.id} className="collapse" id={`attendees-${ev.id}`}>
                    <h5 className="mt-3">Attendees for {ev.title}</h5>
                    <table className="table table-sm table-bordered">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Ticket</th>
                                <th>Qty</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(ev.bookings ?? []).length === 0 ? (
                                <tr>
                                    <td colSpan="8">No attendees</td>
                                </tr>
                            ) : (
                                ev.bookings.map((b) => (
                                    <tr key={b.id}>
                                        <td>{b.id}</td>
                                        <td>{b.user?.name}</td>
                                        <td>{b.user?.email}</td>
                                        <td>{b.ticketType?.type}</td>
                                        <td>{b.quantity}</td>
                                        <td>₹{b.totalPrice}</td>
                                        <td>{b.status}</td>
                                        <td>{new Date(b.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ))}

            {/* Edit Event */}
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

            {/* Create Event */}
            {showCreate && (
                <CreateEventModal
                    show={showCreate}
                    onClose={() => setShowCreate(false)}
                    onCreate={handleCreate}
                />
            )}

            {/* Ticket Type Modal */}
            {showTicketType && eventForTicketType && (
                <AddTicketTypeModal
                    show={showTicketType}
                    event={eventForTicketType}
                    onClose={() => setShowTicketType(false)}
                    onSuccess={() => loadMyEvents()}
                />
            )}

            {/* Reviews modal */}
            {showReviewsModal && (
                <div
                    className="modal-backdrop d-flex justify-content-center align-items-center"
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" }}
                >
                    <div className="card p-3" style={{ minWidth: 600, maxHeight: "80vh", overflowY: "auto" }}>
                        <div className="d-flex justify-content-between">
                            <h5>Event Reviews</h5>
                            <button className="btn-close" onClick={() => setShowReviewsModal(false)}></button>
                        </div>

                        {reviewsLoading && <p>Loading...</p>}
                        {reviewsError && <p className="text-danger">{reviewsError}</p>}
                        {!reviewsLoading && selectedEventReviews.length === 0 && <p>No reviews</p>}

                        {!reviewsLoading && selectedEventReviews.length > 0 && (
                            <table className="table table-bordered mt-3">
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
                                            <td>{r.user?.name}</td>
                                            <td>{r.rating}</td>
                                            <td>{r.reviewText}</td>
                                            <td>{new Date(r.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizerDashboard;
