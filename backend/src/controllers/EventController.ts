import { Request, Response, NextFunction } from "express";
import { EventService } from "../services/EventService";

export class EventController {
    private eventService = new EventService();

    // -------- Public Search with Filters --------
    searchEvents = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const events = await this.eventService.searchEvents(req.query);
            res.json({ success: true, data: events });
        } catch (error) {
            next(error);
        }
    };

    // -------- Public getAllEvents --------
    getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const events = await this.eventService.getAllEvents();
            res.json({ success: true, data: events });
        } catch (error) {
            next(error);
        }
    };

    // -------- Public getEventById --------
    getEventById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const event = await this.eventService.getEventById(req.params.id);
            res.json({ success: true, data: event });
        } catch (error) {
            next(error);
        }
    };

    // -------- Organizer: My Events --------
    getMyEvents = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizerId = req.user.id;
            const events = await this.eventService.getOrganizerEvents(organizerId);
            res.json({ success: true, data: events });
        } catch (error) {
            next(error);
        }
    };

    // -------- Create Event --------
    createEvent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const event = await this.eventService.createEvent(req.body, req.user.id);
            res.status(201).json({ success: true, data: event });
        } catch (error) {
            next(error);
        }
    };

    // -------- Update Event --------
    updateEvent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const event = await this.eventService.updateEvent(req.params.id, req.body);
            res.json({ success: true, data: event });
        } catch (error) {
            next(error);
        }
    };

    // -------- Delete Event --------
    deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.eventService.deleteEvent(req.params.id);
            res.json({ success: true, message: "Event deleted successfully" });
        } catch (error) {
            next(error);
        }
    };
}
