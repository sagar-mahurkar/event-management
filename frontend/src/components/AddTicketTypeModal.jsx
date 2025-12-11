import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AddTicketTypeModal = ({ show, onClose, event, onSuccess }) => {
    const [newTypes, setNewTypes] = useState([]);
    const [existingTypes, setExistingTypes] = useState([]);

    const axiosAuth = axios.create({
        baseURL: BASE_URL,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    // ===============================
    // Fetch previously created ticket types
    // ===============================
    const loadExisting = async () => {
        try {
            const res = await axiosAuth.get(`/tickets/event/${event.id}`);
            const tickets = res.data.data || [];
            setExistingTypes(tickets);
        } catch (err) {
            console.error("Error loading existing ticket types", err);
        }
    };

    useEffect(() => {
        if (event?.id) {
            loadExisting();
        }
    }, [event]);

    // ===============================
    // Add new type to temporary list
    // ===============================
    const addNewType = () => {
        setNewTypes([
            ...newTypes,
            { type: "regular", price: "", limit: "" }
        ]);
    };

    const updateNewType = (index, field, value) => {
        const updated = [...newTypes];
        updated[index][field] = value;
        setNewTypes(updated);
    };

    const removeNewType = (index) => {
        setNewTypes(newTypes.filter((_, i) => i !== index));
    };

    // ===============================
    // Save new ticket types to backend
    // ===============================
    const saveNewTypes = async () => {
        try {
            for (const t of newTypes) {
                await axiosAuth.post(`/tickets/event/${event.id}`, {
                    type: t.type,
                    price: Number(t.price),
                    limit: Number(t.limit),
                });
            }

            alert("Ticket types added successfully!");
            setNewTypes([]);
            loadExisting();
            onSuccess();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to add ticket types");
        }
    };

    // ===============================
    // Delete an existing ticket type
    // ===============================
    const deleteExisting = async (ticketId) => {
        if (!confirm("Delete this ticket type?")) return;

        try {
            await axiosAuth.delete(`/tickets/${ticketId}`);
            alert("Ticket type deleted!");
            loadExisting();
            onSuccess();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to delete");
        }
    };

    if (!show) return null;

    return (
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">Configure Ticket Types – {event.title}</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">

                        {/* EXISTING TICKET TYPES */}
                        <h5>Existing Ticket Types</h5>
                        {existingTypes.length === 0 ? (
                            <p className="text-muted">No ticket types created yet.</p>
                        ) : (
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Price</th>
                                        <th>Limit</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {existingTypes.map((t) => (
                                        <tr key={t.id}>
                                            <td>{t.type.toUpperCase()}</td>
                                            <td>₹{t.price}</td>
                                            <td>{t.limit}</td>

                                            <td>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => deleteExisting(t.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <hr />

                        {/* ADD NEW TICKET TYPES */}
                        <h5>Add New Ticket Types</h5>

                        <button
                            className="btn btn-outline-success mb-3"
                            onClick={addNewType}
                        >
                            + Add Ticket Type
                        </button>

                        {newTypes.map((t, index) => (
                            <div key={index} className="border p-3 mb-3 rounded">

                                <div className="row">
                                    <div className="col-md-4">
                                        <label>Type</label>
                                        <select
                                            className="form-control"
                                            value={t.type}
                                            onChange={(e) =>
                                                updateNewType(index, "type", e.target.value)
                                            }
                                        >
                                            <option value="regular">Regular</option>
                                            <option value="vip">VIP</option>
                                            <option value="student">Student</option>
                                        </select>
                                    </div>

                                    <div className="col-md-4">
                                        <label>Price</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={t.price}
                                            onChange={(e) =>
                                                updateNewType(index, "price", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label>Limit</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={t.limit}
                                            onChange={(e) =>
                                                updateNewType(index, "limit", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="col-md-1 d-flex align-items-end">
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => removeNewType(index)}
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}

                        {newTypes.length > 0 && (
                            <button className="btn btn-success" onClick={saveNewTypes}>
                                Save All Ticket Types
                            </button>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AddTicketTypeModal;
