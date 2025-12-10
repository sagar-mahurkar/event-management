import { useState, useEffect } from "react";
import axios from "axios";

const BookTicketModal = ({ event: initialEvent, onClose, refreshEvent }) => {
  const [event, setEvent] = useState(initialEvent);
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Update local event state whenever parent refreshEvent fetches new data
  useEffect(() => {
    setEvent(initialEvent);
  }, [initialEvent]);

  // Compute available tickets for a given ticket type
  const computeAvailable = (tt) => Number(tt.availableQuantity || 0);

  const selectedTicket =
    event.ticketTypes.find((t) => String(t.id) === String(ticketTypeId)) || null;

  const available = selectedTicket ? computeAvailable(selectedTicket) : 0;

  const handleSubmit = async () => {
    if (!ticketTypeId) return alert("Please select a ticket type");
    if (quantity < 1) return alert("Quantity must be at least 1");
    if (quantity > available) return alert(`Only ${available} tickets left`);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}bookings`,
        {
          eventId: event.id,
          ticketTypeId: Number(ticketTypeId),
          quantity: Number(quantity),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Booking successful!");

      // Refresh parent event to update ticket availability
      const updatedEvent = await refreshEvent();
      setEvent(updatedEvent); // update local state to reflect new availability

      // Reset form
      setTicketTypeId("");
      setQuantity(1);

      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content p-3">
          <h5>Book Tickets</h5>

          <label>Ticket Type</label>
          <select
            className="form-select"
            value={ticketTypeId}
            onChange={(e) => setTicketTypeId(e.target.value)}
          >
            <option value="">Select type</option>
            {event.ticketTypes.map((tt) => {
              const left = computeAvailable(tt);
              return (
                <option key={tt.id} value={tt.id} disabled={left <= 0}>
                  {tt.type} {left > 0 ? `— ${left} left` : "— Sold Out"}
                </option>
              );
            })}
          </select>

          {selectedTicket && (
            <>
              <label className="mt-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={available}
                className="form-control"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />

              <p className="mt-2">Price: ₹{selectedTicket.price}</p>
              <p>Available: {available}</p>
            </>
          )}

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!selectedTicket || available <= 0}
            >
              Confirm Booking
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTicketModal;
