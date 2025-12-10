// src/services/EventService.ts
import { Like, Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
import { userRepo, eventRepo } from "../utils/repositories";
import ErrorHandler from "../middleware/errorHandler";
import httpStatusCodes from "../errors/httpCodes";

export class EventService {

    // -------------------- SEARCH EVENTS WITH FILTERS --------------------
    async searchEvents(query: any) {
        const { keyword, category, location, startDate, endDate, availableOnly, page = 1, limit = 10 } = query;
        const where: any = {};

        if (keyword) where.title = Like(`%${keyword}%`);
        if (category) where.category = category;
        if (location) where.location = Like(`%${location}%`);
        if (startDate && endDate) where.dateTime = Between(new Date(startDate), new Date(endDate));
        else if (startDate) where.dateTime = MoreThanOrEqual(new Date(startDate));
        else if (endDate) where.dateTime = LessThanOrEqual(new Date(endDate));

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const events = await eventRepo.find({
            where,
            skip,
            take,
            relations: ["creator", "bookings", "ticketTypes"],
            order: { dateTime: "ASC" }
        });

        if (availableOnly) {
            return events.filter(event => (event.capacity - (event.bookings?.length || 0)) > 0);
        }

        return events;
    }

    // -------------------- PUBLIC: GET ALL EVENTS --------------------
    async getAllEvents() {
        return eventRepo.find({
            relations: ["creator", "ticketTypes"],
            order: { dateTime: "ASC" }
        });
    }

    // -------------------- PUBLIC: GET EVENT BY ID --------------------
    async getEventById(id: string) {
        const event = await eventRepo.findOne({
            where: { id: Number(id) },
            relations: ["creator", "ticketTypes", "bookings"]
        });

        if (!event) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

        // ---- Compute booked quantity per ticketType ----
        const bookedMap = new Map<number, number>();
        for (const booking of event.bookings) {
            const ttId = booking.ticketTypeId;
            bookedMap.set(ttId, (bookedMap.get(ttId) || 0) + booking.quantity);
        }

        // ---- Add availableQuantity to each ticketType ----
        const ticketTypesWithAvailability = event.ticketTypes.map(tt => {
            const booked = bookedMap.get(tt.id) || 0;
            const available = Math.max(tt.limit - booked, 0);
            return {
                ...tt,
                booked,
                availableQuantity: available
            };
        });

        // ---- Return event with ticketTypes including availableQuantity ----
        return {
            ...event,
            ticketTypes: ticketTypesWithAvailability
        };
    }

    // -------------------- ORGANIZER: GET MY EVENTS --------------------
    async getOrganizerEvents(organizerId: number) {
        const events = await eventRepo.find({
            where: { createdBy: organizerId },
            relations: ["creator", "bookings", "bookings.user", "ticketTypes"],
            order: { dateTime: "ASC" }
        });

        // Compute availability per event for organizer dashboard
        return events.map(event => {
            const bookedMap = new Map<number, number>();
            event.bookings.forEach(b => {
                bookedMap.set(b.ticketTypeId, (bookedMap.get(b.ticketTypeId) || 0) + b.quantity);
            });

            const ticketTypesWithAvailability = event.ticketTypes.map(tt => ({
                ...tt,
                booked: bookedMap.get(tt.id) || 0,
                availableQuantity: Math.max(tt.limit - (bookedMap.get(tt.id) || 0), 0)
            }));

            return {
                ...event,
                ticketTypes: ticketTypesWithAvailability
            };
        });
    }

    // -------------------- ORGANIZER: CREATE EVENT --------------------
    async createEvent(eventData: any, userId: number) {
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) throw new ErrorHandler(httpStatusCodes.UN_AUTHORIZED, "Invalid user");

        const newEvent = eventRepo.create({
            ...eventData,
            creator: user,
            createdBy: user.id,
        });
        return await eventRepo.save(newEvent);
    }

    // -------------------- ORGANIZER/ADMIN: UPDATE EVENT --------------------
    async updateEvent(id: string, updateData: any) {
        const event = await eventRepo.findOne({ where: { id: Number(id) } });
        if (!event) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");
        Object.assign(event, updateData);
        return await eventRepo.save(event);
    }

    // -------------------- ADMIN: DELETE EVENT --------------------
    async deleteEvent(id: string) {
        const event = await eventRepo.findOne({ where: { id: Number(id) } });
        if (!event) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");
        await eventRepo.remove(event);
        return true;
    }
}
