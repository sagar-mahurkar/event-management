import { Link } from "react-router-dom";

const Event = ({ event }) => {
    return (
        <div className="card h-100 shadow-sm hover-shadow">
            <img
                src={
                    event.bannerImage
                        ? `${event.bannerImage}`
                        : "https://via.placeholder.com/600x300?text=No+Image"
                }
                className="card-img-top"
                alt={event.title}
                style={{ height: "200px", objectFit: "cover" }}
            />

            <div className="card-body">
                <h5 className="card-title">{event.title}</h5>
                <p className="card-text">{event.description}</p>

                <p className="text-muted small mb-1">
                    📍 {event.location}
                </p>

                <p className="text-muted small">
                    🗓 {new Date(event.dateTime).toLocaleString()}
                </p>

                <Link to={`/events/${event.id}`} className="btn btn-primary mt-2">
                    View / Book
                </Link>
            </div>
        </div>
    );
};

export default Event;
