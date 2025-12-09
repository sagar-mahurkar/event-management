import { useEffect, useState } from "react";
import axios from "axios";
import EditEventModal from "../components/EditEventModal";
import CreateEventModal from "../components/CreateEventModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const OrganizerDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    const axiosAuth = axios.create({
        baseURL: BASE_URL,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    // Add new event to table
    const handleCreate = (newEvent) => {
        const eventData = newEvent.event || newEvent; // handle API shape
        setEvents(prev => [...prev, eventData]);
    };

    // Load organizer events
    const loadMyEvents = async () => {
        try {
            setLoading(true);
            const res = await axiosAuth.get("/events/organizer/my-events");
            console.log("MY EVENTS API →", res.data);

            // Accept multiple API shapes safely
            let list =
                res.data.events ||
                res.data.data ||
                res.data.data?.events ||
                [];

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

    // Update event after editing
    const handleSave = (updatedEvent) => {
        setEvents(prev =>
            prev.map(ev => (ev.id === updatedEvent.id ? { ...ev, ...updatedEvent } : ev))
        );
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Organizer Dashboard</h2>

            <div className="d-flex justify-content-between mt-3">
                <h4>Your Events</h4>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    + Create New Event
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}

            {/* EVENTS TABLE */}
            <table className="table mt-3 table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Date/Time</th>
                        <th>Location</th>
                        <th>Category</th>
                        <th>Capacity</th>
                        <th>Attendees</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {events.map(ev => (
                        <tr key={ev.id}>
                            <td>{ev.id}</td>
                            <td>{ev.title}</td>
                            <td>{new Date(ev.dateTime).toLocaleString()}</td>
                            <td>{ev.location}</td>
                            <td>{ev.category}</td>
                            <td>{ev.capacity}</td>

                            <td>
                                {(ev.bookings ?? []).length}
                                <button
                                    className="btn btn-sm btn-outline-info ms-2"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#attendees-${ev.id}`}
                                >
                                    View
                                </button>
                            </td>

                            <td>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setSelectedEvent(ev);
                                        setShowModal(true);
                                    }}
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ATTENDEE SECTIONS */}
            {events.map(ev => (
                <div
                    key={ev.id}
                    className="collapse mt-2"
                    id={`attendees-${ev.id}`}
                >
                    <h5>Attendees for: {ev.title}</h5>
                    <table className="table table-sm table-bordered">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Booked At</th>
                            </tr>
                        </thead>

                        <tbody>
                            {(ev.bookings ?? []).length === 0 ? (
                                <tr>
                                    <td colSpan="4">No attendees yet</td>
                                </tr>
                            ) : (
                                (ev.bookings ?? []).map(b => (
                                    <tr key={b.id}>
                                        <td>{b.id}</td>
                                        <td>{b.user?.name}</td>
                                        <td>{b.user?.email}</td>
                                        <td>{new Date(b.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ))}

            {/* EDIT EVENT MODAL */}
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

            {/* CREATE EVENT MODAL */}
            {showCreate && (
                <CreateEventModal
                    show={showCreate}
                    onClose={() => setShowCreate(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
};

export default OrganizerDashboard;
