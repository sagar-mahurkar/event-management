import { useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const EditTicketTypeModal = ({ show, onClose, ticket, onSuccess }) => {
    const [type, setType] = useState(ticket.type);
    const [price, setPrice] = useState(ticket.price);
    const [limit, setLimit] = useState(ticket.limit);

    const axiosAuth = axios.create({
        baseURL: BASE_URL,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const updateTicket = async () => {
        try {
            await axiosAuth.put(`/tickets/${ticket.id}`, {
                type,
                price: Number(price),
                limit: Number(limit),
            });

            alert("Ticket Type updated!");
            onSuccess();
            onClose();

        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Failed to update ticket type");
        }
    };

    const deleteTicket = async () => {
        if (!confirm("Delete this ticket type?")) return;

        try {
            await axiosAuth.delete(`/tickets/${ticket.id}`);
            alert("Ticket Type deleted!");
            onSuccess();
            onClose();

        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Failed to delete ticket type");
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">

                    {/* MODAL HEADER */}
                    <div className="modal-header">
                        <h5 className="modal-title">
                            Edit Ticket Type – {ticket.type.toUpperCase()}
                        </h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>

                    {/* MODAL BODY */}
                    <div className="modal-body">

                        {/* TYPE */}
                        <label className="form-label fw-bold">Ticket Type</label>
                        <select
                            className="form-control mb-3"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="regular">Regular</option>
                            <option value="vip">VIP</option>
                            <option value="student">Student</option>
                        </select>

                        {/* PRICE */}
                        <label className="form-label fw-bold">Price</label>
                        <input
                            type="number"
                            className="form-control mb-3"
                            value={price}
                            min="0"
                            onChange={(e) => setPrice(e.target.value)}
                        />

                        {/* LIMIT */}
                        <label className="form-label fw-bold">Limit</label>
                        <input
                            type="number"
                            className="form-control mb-3"
                            value={limit}
                            min="1"
                            onChange={(e) => setLimit(e.target.value)}
                        />
                    </div>

                    {/* MODAL FOOTER */}
                    <div className="modal-footer">

                        <button className="btn btn-danger" onClick={deleteTicket}>
                            Delete Ticket Type
                        </button>

                        <button className="btn btn-primary" onClick={updateTicket}>
                            Save Changes
                        </button>

                        <button className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EditTicketTypeModal;
