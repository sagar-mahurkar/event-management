// src/services/BookingService.ts
import { bookingRepo, eventRepo, ticketTypeRepo, userRepo } from "../utils/repositories";
import { BookingStatus, UserRole } from "../utils/enums";
import ErrorHandler from "../middleware/errorHandler";
import httpStatusCodes from "../errors/httpCodes";

export class BookingService {

    // ---------------- CALCULATE AVAILABILITY FOR A TICKET TYPE ----------------
    async getTicketTypeAvailability(ticketTypeId: number) {
        // Get ticket type
        const ticketType = await ticketTypeRepo.findOne({
            where: { id: ticketTypeId }
        });

        if (!ticketType) {
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Ticket type not found");
        }

        // Calculate booked count
        const bookedResult = await bookingRepo
            .createQueryBuilder("booking")
            .select("SUM(booking.quantity)", "sum")
            .where("booking.ticket_type_id = :ticketTypeId", { ticketTypeId })
            .andWhere("booking.status = :status", { status: BookingStatus.BOOKED })
            .getRawOne();

        const booked = Number(bookedResult.sum) || 0;
        const available = ticketType.limit - booked;

        return {
            ticketTypeId,
            limit: ticketType.limit,
            booked,
            available: available < 0 ? 0 : available
        };
    }

    // ---------------- GET USER BOOKINGS ----------------
    async getUserBookings(userId: number) {
        return bookingRepo.find({
            where: { bookedBy: userId },
            relations: ["event", "ticketType", "user"],
            order: { createdAt: "DESC" }
        });
    }

    // ---------------- CREATE BOOKING ----------------
    async createBooking(userId: number, eventId: number, ticketTypeId: number, quantity: number) {
        // Validate user
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "User not found");

        // Validate event
        const event = await eventRepo.findOne({
            where: { id: eventId },
            relations: ["ticketTypes", "bookings"]
        });
        if (!event) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

        // Validate ticket type
        const ticketType = await ticketTypeRepo.findOne({
            where: { id: ticketTypeId, event: { id: eventId } }
        });
        if (!ticketType) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Ticket type not found for this event");

        // ---------------- AVAILABILITY CHECK ----------------
        const availability = await this.getTicketTypeAvailability(ticketTypeId);

        if (quantity > availability.available) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                `Only ${availability.available} tickets available for this ticket type`
            );
        }

        // Validate event capacity
        const totalBooked = await bookingRepo
            .createQueryBuilder("booking")
            .select("SUM(booking.quantity)", "sum")
            .where("booking.event_id = :eventId", { eventId })
            .andWhere("booking.status = :status", { status: BookingStatus.BOOKED })
            .getRawOne();

        const remainingEventCapacity = event.capacity - (Number(totalBooked.sum) || 0);

        if (quantity > remainingEventCapacity) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                `Only ${remainingEventCapacity} tickets remaining for this event`
            );
        }

        // Calculate total price
        const totalPrice = Number(ticketType.price) * quantity;

        // Create booking
        const booking = bookingRepo.create({
            user,
            bookedBy: user.id,
            event,
            eventId: event.id,
            ticketType,
            ticketTypeId: ticketType.id,
            quantity,
            totalPrice,
            status: BookingStatus.BOOKED
        });

        return bookingRepo.save(booking);
    }

    // ---------------- CANCEL BOOKING ----------------
    async cancelBooking(bookingId: number, userId: number) {
        const booking = await bookingRepo.findOne({
            where: { id: bookingId, bookedBy: userId },
            relations: ["event", "ticketType"]
        });

        if (!booking) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Booking not found");

        booking.status = BookingStatus.CANCELLED;
        return bookingRepo.save(booking);
    }

    // ---------------- GET EVENT BOOKINGS (Organizer/Admin) ----------------
    async getEventBookings(eventId: number, requesterId: number) {
        const event = await eventRepo.findOne({ where: { id: eventId }, relations: ["creator"] });
        if (!event) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

        const user = await userRepo.findOne({ where: { id: requesterId } });
        if (!user) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "User not found");

        if (event.createdBy !== requesterId && user.role !== UserRole.ADMIN) {
            throw new ErrorHandler(httpStatusCodes.UN_AUTHORIZED, "Access denied");
        }

        return bookingRepo.find({
            where: { eventId },
            relations: ["user", "ticketType"],
            order: { createdAt: "DESC" }
        });
    }
}
