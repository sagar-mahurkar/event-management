import { useState, useEffect } from "react";
import axios from "axios";
import EditEventModal from "../components/EditEventModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AdminDashboard = () => {
    const [selected, setSelected] = useState("pending-organizers");

    const [pendingOrganizers, setPendingOrganizers] = useState([]);
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Edit modals
    const [editUserData, setEditUserData] = useState(null);
    const [editEventData, setEditEventData] = useState(null);

    // ============================================
    // LOAD LOGGED-IN ADMIN NAME
    // ============================================
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const raw = localStorage.getItem("user");
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                setAdmin(parsed);
            } catch (e) {
                console.error("Invalid user JSON in localStorage");
            }
        }
    }, []);

    const axiosAuth = axios.create({
        baseURL: BASE_URL,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    // ============================================================
    // LOADERS
    // ============================================================
    const loadPendingOrganizers = async () => {
        try {
            setLoading(true);
            const res = await axiosAuth.get("/admin/organizers/pending");
            setPendingOrganizers(res.data || []);
        } catch (err) {
            setError("Failed to load organizer requests");
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await axiosAuth.get("/admin/users");
            setUsers(res.data || []);
        } catch (err) {
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const loadEvents = async () => {
        try {
            setLoading(true);
            const res = await axiosAuth.get("/events");
            setEvents(res.data?.data || []);
        } catch (err) {
            setError("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setError("");
        if (selected === "pending-organizers") loadPendingOrganizers();
        if (selected === "users") loadUsers();
        if (selected === "events") loadEvents();
    }, [selected]);

    // ============================================================
    // ORGANIZER ACTION HANDLERS
    // ============================================================
    const approveOrganizer = async (id) => {
        if (!confirm("Approve this organizer request?")) return;

        try {
            await axiosAuth.put(`/admin/organizers/${id}/approve`);
            loadPendingOrganizers();
        } catch (err) {
            alert("Failed to approve");
        }
    };

    const rejectOrganizer = async (id) => {
        if (!confirm("Reject this organizer request?")) return;

        try {
            await axiosAuth.put(`/admin/organizers/${id}/reject`);
            loadPendingOrganizers();
        } catch (err) {
            alert("Failed to reject");
        }
    };

    // ============================================================
    // USER ACTION HANDLERS
    // ============================================================
    const deleteUser = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            await axiosAuth.delete(`/admin/users/${id}`);
            loadUsers();
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const saveUserChanges = async () => {
        try {
            await axiosAuth.put(`/admin/users/${editUserData.id}`, editUserData);
            setEditUserData(null);
            loadUsers();
        } catch (err) {
            alert("Failed to update user");
        }
    };

    // ============================================================
    // EVENT ACTION HANDLERS
    // ============================================================
    const deleteEvent = async (id) => {
        if (!confirm("Delete this event?")) return;

        try {
            await axiosAuth.delete(`/events/${id}`);
            loadEvents();
        } catch (err) {
            alert("Failed to delete event");
        }
    };

    const saveEventChanges = async () => {
        try {
            await axiosAuth.put(`/events/${editEventData.id}`, editEventData);
            setEditEventData(null);
            loadEvents();
        } catch (err) {
            alert("Failed to update event");
        }
    };

    // ============================================================
    // RENDER TABLES
    // ============================================================
    const renderPendingOrganizers = () => (
        <>
            <h3>Pending Organizer Requests</h3>

            <table className="table mt-3 table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Requested At</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {pendingOrganizers.map((o) => (
                        <tr key={o.id}>
                            <td>{o.id}</td>
                            <td>{o.name}</td>
                            <td>{o.email}</td>
                            <td>{o.message || "—"}</td>
                            <td>{o.status}</td>
                            <td>{new Date(o.createdAt).toLocaleString()}</td>

                            <td>
                                <button
                                    className="btn btn-success btn-sm me-2"
                                    onClick={() => approveOrganizer(o.id)}
                                >
                                    Approve
                                </button>

                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => rejectOrganizer(o.id)}
                                >
                                    Reject
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );

    const renderUsers = () => (
        <>
            <h3>All Users</h3>

            <table className="table mt-3 table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>{u.status}</td>
                            <td>{new Date(u.createdAt).toLocaleString()}</td>

                            <td>
                                <button className="btn btn-primary btn-sm me-2" onClick={() => setEditUserData(u)}>
                                    Edit
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );

    const renderEvents = () => (
        <>
            <h3>All Events</h3>

            <table className="table mt-3 table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Date/Time</th>
                        <th>Location</th>
                        <th>Category</th>
                        <th>Capacity</th>
                        <th>Created By</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {events.map((ev) => (
                        <tr key={ev.id}>
                            <td>{ev.id}</td>
                            <td>{ev.title}</td>
                            <td>{new Date(ev.dateTime).toLocaleString()}</td>
                            <td>{ev.location}</td>
                            <td>{ev.category}</td>
                            <td>{ev.capacity}</td>
                            <td>{ev.createdBy}</td>
                            <td>{new Date(ev.createdAt).toLocaleString()}</td>

                            <td>
                                <button className="btn btn-primary btn-sm me-2" onClick={() => setEditEventData(ev)}>
                                    Edit
                                </button>

                                <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(ev.id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );

    // ============================================================
    // MAIN RENDER
    // ============================================================
    const renderContent = () => {
        if (loading) return <p>Loading…</p>;
        if (error) return <p className="text-danger">{error}</p>;

        if (selected === "pending-organizers") return renderPendingOrganizers();
        if (selected === "users") return renderUsers();
        if (selected === "events") return renderEvents();
    };

    return (
        <div className="d-flex" style={{ width: "100%" }}>

            {/* Sidebar */}
            <div
                style={{
                    width: "20%",
                    minHeight: "100vh",
                    background: "#f0f0f0",
                    borderRight: "1px solid #ccc",
                    padding: "1rem"
                }}
            >
                {/* ===================================== */}
                {/* SHOW ADMIN NAME + EMAIL */}
                {/* ===================================== */}
                <h4>Welcome, {admin?.name || "Admin"}</h4>
                <p style={{ fontSize: "0.9rem", color: "#555" }}>{admin?.email}</p>
                <hr />

                <h4>Admin Menu</h4>

                <ul className="list-group mt-3">
                    <li
                        className={`list-group-item ${selected === "pending-organizers" ? "active" : ""}`}
                        onClick={() => setSelected("pending-organizers")}
                        style={{ cursor: "pointer" }}
                    >
                        Pending Organizer Requests
                    </li>

                    <li
                        className={`list-group-item ${selected === "users" ? "active" : ""}`}
                        onClick={() => setSelected("users")}
                        style={{ cursor: "pointer" }}
                    >
                        All Users
                    </li>

                    <li
                        className={`list-group-item ${selected === "events" ? "active" : ""}`}
                        onClick={() => setSelected("events")}
                        style={{ cursor: "pointer" }}
                    >
                        All Events
                    </li>
                </ul>
            </div>

            {/* Content */}
            <div style={{ width: "80%", padding: "2rem" }}>
                {renderContent()}
            </div>

            {/* User Modal */}
            {editUserData && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">Edit User</h5>
                                <button className="btn-close" onClick={() => setEditUserData(null)}></button>
                            </div>

                            <div className="modal-body">
                                <label>Name</label>
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    value={editUserData.name}
                                    onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                                />

                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control mb-2"
                                    value={editUserData.email}
                                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                                />

                                <label>Role</label>
                                <select
                                    className="form-control mb-2"
                                    value={editUserData.role}
                                    onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                                >
                                    <option>attendee</option>
                                    <option>organizer</option>
                                    <option>admin</option>
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setEditUserData(null)}>Cancel</button>
                                <button className="btn btn-primary" onClick={saveUserChanges}>Save Changes</button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Event Modal */}
            {editEventData && (
                <EditEventModal
                    show={true}
                    event={editEventData}
                    onClose={() => setEditEventData(null)}
                    onSave={(updatedEvent) => {
                        setEvents(events.map(ev => ev.id === updatedEvent.data.id ? updatedEvent.data : ev));
                    }}
                />
            )}

        </div>
    );
};

export default AdminDashboard;
