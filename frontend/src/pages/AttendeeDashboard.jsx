import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AttendeeDashboard = () => {
    const [selected, setSelected] = useState("upcoming");

    const [upcoming, setUpcoming] = useState([]);
    const [past, setPast] = useState([]);
    const [cancelled, setCancelled] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const axiosAuth = axios.create({
        baseURL: BASE_URL,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    // Load all bookings
    const loadBookings = async () => {
        try {
            setLoading(true);
            const res = await axiosAuth.get("/bookings/my-bookings");
            console.log("MY BOOKINGS →", res.data);

            const list =
                res.data.bookings ||
                res.data.data ||
                res.data.data?.bookings ||
                [];

            const now = new Date();
            const upcomingList = [];
            const pastList = [];
            const cancelledList = [];

            list.forEach((b) => {
                if (b.status === "cancelled") {
                    cancelledList.push(b);
                } else if (new Date(b.event.dateTime) > now) {
                    upcomingList.push(b);
                } else {
                    pastList.push(b);
                }
            });

            upcomingList.sort((a, b) => new Date(a.event.dateTime) - new Date(b.event.dateTime));
            pastList.sort((a, b) => new Date(b.event.dateTime) - new Date(a.event.dateTime));

            setUpcoming(upcomingList);
            setPast(pastList);
            setCancelled(cancelledList);
        } catch (err) {
            console.error(err);
            setError("Failed to load your bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    // Upgrade role to organizer
    const handleRoleUpgrade = async () => {
        if (!confirm("Are you sure you want to upgrade to Organizer?")) return;

        try {
            await axiosAuth.patch("/auth/upgrade-role", { role: "organizer" });
            alert("Role upgraded successfully! Please login again.");
            localStorage.removeItem("token");
            window.location.href = "/login";
        } catch (err) {
            console.error(err);
            alert("Failed to upgrade role");
        }
    };

    // Reusable table
    const BookingTable = ({ title, data }) => (
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
                        <th>Booked At</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="text-center">
                                No records found
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
                                <td>{new Date(b.createdAt).toLocaleString()}</td>
                                <td className={b.status === "cancelled" ? "text-danger" : "text-success"}>
                                    {b.status}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    // What to show based on sidebar selection
    const renderContent = () => {
        if (loading) return <p>Loading…</p>;
        if (error) return <p className="text-danger">{error}</p>;

        if (selected === "upcoming")
            return <BookingTable title="Upcoming Events" data={upcoming} />;
        if (selected === "past")
            return <BookingTable title="Past Events" data={past} />;
        if (selected === "cancelled")
            return <BookingTable title="Cancelled Bookings" data={cancelled} />;
    };

    return (
        <div className="d-flex" style={{ width: "100%" }}>

            {/* Sidebar */}
            <div
                style={{
                    width: "15%",
                    minHeight: "100vh",
                    background: "#f0f0f0",
                    padding: "1rem",
                    borderRight: "1px solid #ccc",
                }}
            >
                <h4>Attendee Menu</h4>

                <button
                    className="btn btn-warning w-100 mt-3"
                    onClick={handleRoleUpgrade}
                >
                    Upgrade to Organizer
                </button>

                <ul className="list-group mt-4">
                    <li
                        className={`list-group-item ${selected === "upcoming" ? "active" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelected("upcoming")}
                    >
                        Upcoming Bookings
                    </li>

                    <li
                        className={`list-group-item ${selected === "past" ? "active" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelected("past")}
                    >
                        Past Bookings
                    </li>

                    <li
                        className={`list-group-item ${selected === "cancelled" ? "active" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelected("cancelled")}
                    >
                        Cancelled Bookings
                    </li>
                </ul>
            </div>

            {/* Main content */}
            <div style={{ width: "85%", padding: "2rem" }}>
                <h2>Attendee Dashboard</h2>
                {renderContent()}
            </div>
        </div>
    );
};

export default AttendeeDashboard;
