import { useState } from "react";
import api from "../utils/api";

const CreateEventModal = ({ show, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dateTime: "",
        location: "",
        category: "",
        capacity: "",
    });

    const [bannerImage, setBannerImage] = useState(null);
    const [teaserVideo, setTeaserVideo] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!show) return null;

    // ----------------------------------------------------
    // Helper: Upload Video After Event Creation (PATCH)
    // ----------------------------------------------------
    const uploadMedia = async (eventId) => {
        const mediaData = new FormData();
        mediaData.append("video", teaserVideo);

        const mediaRes = await api.patch(
            `/events/${eventId}/media`,
            mediaData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        return mediaRes.data.event || mediaRes.data.data;
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError("");

            // ----------------------------------------------------
            // 1️⃣ POST /events  (Text + Banner Image)
            // ----------------------------------------------------
            const payload = new FormData();

            // append all text fields
            Object.keys(formData).forEach((key) => {
                payload.append(key, formData[key]);
            });

            // append banner image if selected
            if (bannerImage) payload.append("banner", bannerImage);

            const res = await api.post("/events", payload, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            let createdEvent = res.data.event || res.data.data;

            // ----------------------------------------------------
            // 2️⃣ PATCH (Upload Video) — only if video selected
            // ----------------------------------------------------
            if (teaserVideo) {
                const updated = await uploadMedia(createdEvent.id);
                createdEvent = { ...createdEvent, ...updated };
            }

            // Return to Dashboard
            onCreate(createdEvent);
            onClose();

        } catch (err) {
            console.error(err);
            setError("Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content p-3">

                    <div className="modal-header">
                        <h5 className="modal-title">Create New Event</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        {error && <p className="text-danger">{error}</p>}

                        <label>Title</label>
                        <input
                            type="text"
                            className="form-control mb-2"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />

                        <label>Description</label>
                        <textarea
                            className="form-control mb-2"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />

                        <label>Date & Time</label>
                        <input
                            type="datetime-local"
                            className="form-control mb-2"
                            value={formData.dateTime}
                            onChange={(e) =>
                                setFormData({ ...formData, dateTime: e.target.value })
                            }
                        />

                        <label>Location</label>
                        <input
                            type="text"
                            className="form-control mb-2"
                            value={formData.location}
                            onChange={(e) =>
                                setFormData({ ...formData, location: e.target.value })
                            }
                        />

                        <label>Category</label>
                        <input
                            type="text"
                            className="form-control mb-2"
                            value={formData.category}
                            onChange={(e) =>
                                setFormData({ ...formData, category: e.target.value })
                            }
                        />

                        <label>Capacity</label>
                        <input
                            type="number"
                            className="form-control mb-2"
                            value={formData.capacity}
                            onChange={(e) =>
                                setFormData({ ...formData, capacity: e.target.value })
                            }
                        />

                        <hr />

                        <label>Upload Banner Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="form-control mb-2"
                            onChange={(e) => setBannerImage(e.target.files[0])}
                        />

                        <label>Upload Teaser Video</label>
                        <input
                            type="file"
                            accept="video/*"
                            className="form-control mb-2"
                            onChange={(e) => setTeaserVideo(e.target.files[0])}
                        />
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Event"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreateEventModal;
