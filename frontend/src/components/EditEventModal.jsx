import { useState } from "react";
import api from "../utils/api";

const EditEventModal = ({ show, onClose, event, onSave }) => {
    const [formData, setFormData] = useState({
        title: event.title,
        description: event.description,
        dateTime: new Date(event.dateTime).toISOString().slice(0,16),
        location: event.location,
        category: event.category,
        capacity: event.capacity,
    });

    const [bannerImage, setBannerImage] = useState(null);
    const [teaserVideo, setTeaserVideo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!show || !event) return null;

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError("");

            const mediaData = new FormData();
            if (bannerImage) mediaData.append("banner", bannerImage);
            if (teaserVideo) mediaData.append("video", teaserVideo);

            // 1️⃣ Update text fields first
            const textRes = await api.put(`/events/${event.id}`, formData);

            // 2️⃣ Update media if any
            if (bannerImage || teaserVideo) {
                await api.patch(`/events/${event.id}/media`, mediaData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }

            onSave({ ...textRes.data, bannerImage, teaserVideo });
            onClose();
        } catch (err) {
            setError("Failed to update event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content p-3">

                    <div className="modal-header">
                        <h5 className="modal-title">Edit Event</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        {error && <p className="text-danger">{error}</p>}

                        {/* Text Fields */}
                        <label>Title</label>
                        <input
                            type="text"
                            className="form-control mb-2"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />

                        <label>Description</label>
                        <textarea
                            className="form-control mb-2"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />

                        <label>Date & Time</label>
                        <input
                            type="datetime-local"
                            className="form-control mb-2"
                            value={formData.dateTime}
                            onChange={e => setFormData({ ...formData, dateTime: e.target.value })}
                        />

                        <label>Location</label>
                        <input
                            type="text"
                            className="form-control mb-2"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />

                        <label>Category</label>
                        <input
                            type="text"
                            className="form-control mb-2"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        />

                        <label>Capacity</label>
                        <input
                            type="number"
                            className="form-control mb-2"
                            value={formData.capacity}
                            onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                        />

                        <hr />

                        {/* Media Upload */}
                        <h6>Current Banner:</h6>
                        {event.bannerImage ? <img src={event.bannerImage} alt="banner" height={120} className="mb-3" /> : <p>No banner</p>}

                        <label>Upload New Banner</label>
                        <input type="file" accept="image/*" className="form-control mb-2" onChange={e => setBannerImage(e.target.files[0])} />

                        <h6>Current Teaser Video:</h6>
                        {event.teaserVideo ? (
                            <video width="300" controls className="mb-3">
                                <source src={event.teaserVideo} />
                            </video>
                        ) : <p>No video</p>}

                        <label>Upload New Video</label>
                        <input type="file" accept="video/*" className="form-control mb-2" onChange={e => setTeaserVideo(e.target.files[0])} />
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EditEventModal;
