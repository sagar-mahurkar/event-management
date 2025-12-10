import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AddTicketTypeModal = ({ show, onClose, event, onSuccess }) => {
    const [type, setType] = useState("regular");
    const [price, setPrice] = useState("");
    const [limit, setLimit] = useState("");
    const [existingTotalLimit, setExistingTotalLimit] = useState(0);
    const [remainingCapacity, setRemainingCapacity] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");

    const axiosAuth = axios.create({
        baseURL: BASE_URL,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    useEffect(() => {
        if (!event) return;

        const fetchExisting = async () => {
            try {
                const res = await axiosAuth.get(`/tickets/event/${event.id}`);
                const tickets = res.data.data || [];
                const totalLimit = tickets.reduce((sum, t) => sum + Number(t.limit || 0), 0);
                setExistingTotalLimit(totalLimit);
                setRemainingCapacity(event.capacity - totalLimit);
            } catch (err) {
                console.error("Error loading existing tickets", err);
            }
        };

        fetchExisting();
    }, [event]);

    useEffect(() => {
        const numLimit = Number(limit);
        if (numLimit > remainingCapacity) setErrorMsg(`Limit exceeds remaining capacity (${remainingCapacity})`);
        else if (numLimit <= 0) setErrorMsg("Limit must be greater than 0");
        else setErrorMsg("");
    }, [limit, remainingCapacity]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (errorMsg) return;

        try {
            const body = { type, price: Number(price), limit: Number(limit) };
            const res = await axiosAuth.post(`/tickets/event/${event.id}`, body);
            const created = res.data?.data || res.data?.ticketType || res.data || null;
            onSuccess(created);
            onClose();
        } catch (err) {
            console.error("❌ Error creating ticket type:", err);
            alert(err?.response?.data?.message || "Failed to create ticket type");
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add Ticket Type for: {event.title}</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="alert alert-secondary p-2">
                                <div><strong>Event Capacity:</strong> {event.capacity}</div>
                                <div><strong>Already Allocated:</strong> {existingTotalLimit}</div>
                                <div><strong>Remaining Capacity:</strong> {remainingCapacity}</div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Ticket Type</label>
                                <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="regular">Regular</option>
                                    <option value="vip">VIP</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Price</label>
                                <input type="number" className="form-control" value={price} min="0" onChange={(e) => setPrice(e.target.value)} required />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Limit</label>
                                <input type="number" className={`form-control ${errorMsg ? "is-invalid" : ""}`} value={limit} min="1" max={remainingCapacity} onChange={(e) => setLimit(e.target.value)} required />
                                {errorMsg && <div className="invalid-feedback">{errorMsg}</div>}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-success" disabled={!!errorMsg || !limit || !price}>Add Ticket Type</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTicketTypeModal;
