// src/services/TicketService.ts
import { ticketTypeRepo, eventRepo, bookingRepo } from "../utils/repositories";
import ErrorHandler from "../middleware/errorHandler";
import httpStatusCodes from "../errors/httpCodes";
import { TicketCategory } from "../utils/enums"

export class TicketService {

    // ---------------- GET TICKETS FOR EVENT ----------------
    async getEventTickets(eventId: number) {
        const event = await eventRepo.findOne({ where: { id: eventId } });
        if (!event) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

        return ticketTypeRepo.find({
            where: { eventId },
            order: { createdAt: "ASC" }
        });
    }

    // ---------------- CREATE TICKET TYPE ----------------
    async createTicketType(eventId: number, ticketData: any) {
        const event = await eventRepo.findOne({
            where: { id: eventId },
            relations: ["ticketTypes"]
        });

        if (!event) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

        const { type, price, limit, dynamicPricingRules } = ticketData;

        if (!type || !price || !limit) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Type, price, and limit are required");
        }

        // Optional: Validate type is one of your enum options
        if (!Object.values(TicketCategory).includes(type)) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                `Invalid ticket type. Must be: ${Object.values(TicketCategory).join(", ")}`
            );
        }

        // -------------------------------
        // CHECK #1: ticket limit ≤ event capacity
        // -------------------------------
        if (limit > event.capacity) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                `Ticket limit cannot exceed event capacity (${event.capacity})`
            );
        }

        // -------------------------------
        // CHECK #2: Sum of all ticket limits ≤ event capacity
        // -------------------------------
        const existingTotalLimit = event.ticketTypes.reduce(
            (sum, t) => sum + t.limit,
            0
        );

        const newTotalLimit = existingTotalLimit + limit;

        if (newTotalLimit > event.capacity) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                `Total ticket limit (${newTotalLimit}) exceeds event capacity (${event.capacity})`
            );
        }

        // -------------------------------
        // CREATE TICKET TYPE
        // -------------------------------
        const ticketType = ticketTypeRepo.create({
            event,
            eventId,
            type, // <-- ✔ FIXED: use request value, not enum name
            price,
            limit,
            dynamicPricingRules: dynamicPricingRules || null
        });

        return ticketTypeRepo.save(ticketType);
    }



    // ---------------- UPDATE TICKET TYPE ----------------
    async updateTicketType(ticketTypeId: number, updateData: any) {

        // Fetch ticket + event + all ticket types for validation
        const ticketType = await ticketTypeRepo.findOne({
            where: { id: ticketTypeId },
            relations: ["event", "event.ticketTypes"],
        });

        if (!ticketType)
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Ticket type not found");

        const event = ticketType.event;

        // Extract incoming limit (if provided)
        const newLimit = updateData.limit ?? ticketType.limit; // keep old limit if not updating

        // -------------------------------
        // CHECK #1: new limit ≤ event capacity
        // -------------------------------
        if (newLimit > event.capacity) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                `Ticket limit cannot exceed event capacity (${event.capacity})`
            );
        }

        // -------------------------------
        // CHECK #2: total limits across all ticket types ≤ event.capacity
        // -------------------------------
        const existingTotalLimit = event.ticketTypes.reduce((sum, t) => {
            return t.id === ticketTypeId ? sum : sum + t.limit; // exclude current type
        }, 0);

        const newTotalLimit = existingTotalLimit + newLimit;

        if (newTotalLimit > event.capacity) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                `Total ticket limits (${newTotalLimit}) exceed event capacity (${event.capacity}).`
            );
        }

        // -------------------------------
        // UPDATE THE MODEL
        // -------------------------------
        Object.assign(ticketType, updateData);

        return ticketTypeRepo.save(ticketType);
    }


    // ---------------- DELETE TICKET TYPE ----------------
    async deleteTicketType(ticketTypeId: number) {
        // 1) Load ticket type with its event + event.bookings
        const ticketType = await ticketTypeRepo.findOne({
            where: { id: ticketTypeId },
            relations: ["event", "event.bookings"]
        });

        if (!ticketType) {
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Ticket type not found");
        }

        const event = ticketType.event;

        // 2) Check if there are bookings for this ticket type
        const bookingsForThisType = event.bookings.filter(
            (b) => b.ticketTypeId === ticketTypeId
        );

        if (bookingsForThisType.length > 0) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Cannot delete ticket type because bookings exist for this ticket type"
            );
        }

        // 3) Store limit before removing
        const restoredLimit = ticketType.limit;

        // 4) Delete ticket type
        await ticketTypeRepo.remove(ticketType);

        // 5) Calculate remaining capacity:
        // event.capacity  = total allowed
        // event.bookings.length = already used capacity
        // restoredLimit = capacity that becomes free after deleting this ticket type
        const usedCapacity = event.bookings.length;
        const remainingCapacity = (event.capacity - usedCapacity) + restoredLimit;

        return {
            success: true,
            message: "Ticket type deleted successfully",
            remainingCapacity
        };
    }
}
