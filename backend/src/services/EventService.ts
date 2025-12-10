// src/services/EventService.ts
import { Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
import { userRepo, eventRepo } from "../utils/repositories";
import ErrorHandler from "../middleware/errorHandler";
import httpStatusCodes from "../errors/httpCodes";

export class EventService {

    // -------------------- SEARCH EVENTS WITH FILTERS (QueryBuilder) --------------------
    async searchEvents(query: any) {
        const {
            keyword,
            category,
            location,
            startDate,
            endDate,
            availableOnly,
            page = 1,
            limit = 10
        } = query;

        const qb = eventRepo.createQueryBuilder("event")
            .leftJoinAndSelect("event.creator", "creator")
            .leftJoinAndSelect("event.bookings", "bookings")
            .leftJoinAndSelect("event.ticketTypes", "ticketTypes")
            .orderBy("event.dateTime", "ASC");

        // --- Pagination ---
        const skip = (Number(page) - 1) * Number(limit);
        qb.skip(skip).take(Number(limit));

        // We'll collect OR conditions for text-like matching (keyword, category, location)
        const orConditions: string[] = [];
        const parameters: Record<string, any> = {};

        if (keyword) {
            // search title OR description
            orConditions.push("(LOWER(event.title) LIKE :kw OR LOWER(event.description) LIKE :kw)");
            parameters["kw"] = `%${String(keyword).toLowerCase()}%`;
        }

        if (category) {
            // match category OR title (so "Music" matches category and event titles)
            orConditions.push("(LOWER(event.category) LIKE :cat OR LOWER(event.title) LIKE :cat)");
            parameters["cat"] = `%${String(category).toLowerCase()}%`;
        }

        if (location) {
            orConditions.push("(LOWER(event.location) LIKE :loc)");
            parameters["loc"] = `%${String(location).toLowerCase()}%`;
        }

        // Apply OR conditions (if any)
        if (orConditions.length > 0) {
            // join OR pieces with OR and wrap in parenthesis
            qb.andWhere("(" + orConditions.join(" OR ") + ")", parameters);
        }

        // Apply date filters as AND conditions (they narrow results)
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            qb.andWhere("event.dateTime BETWEEN :startDate AND :endDate", {
                startDate: start.toISOString(),
                endDate: end.toISOString()
            });
        } else if (startDate) {
            const start = new Date(startDate);
            qb.andWhere("event.dateTime >= :startDate", { startDate: start.toISOString() });
        } else if (endDate) {
            const end = new Date(endDate);
            qb.andWhere("event.dateTime <= :endDate", { endDate: end.toISOString() });
        }

        // Execute query
        const events = await qb.getMany();

        // availableOnly filter is applied in-memory because it depends on booking counts
        if (availableOnly) {
            return events.filter(event =>
                (event.capacity - (event.bookings?.length || 0)) > 0
            );
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

        if (!event)
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

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
        if (!user)
            throw new ErrorHandler(httpStatusCodes.UN_AUTHORIZED, "Invalid user");

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
        if (!event)
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

        Object.assign(event, updateData);

        return await eventRepo.save(event);
    }

    // -------------------- ADMIN: DELETE EVENT --------------------
    async deleteEvent(id: string) {
        const event = await eventRepo.findOne({ where: { id: Number(id) } });
        if (!event)
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

        await eventRepo.remove(event);

        return true;
    }
}
