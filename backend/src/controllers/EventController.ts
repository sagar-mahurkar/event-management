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
            let bannerUrl = null;

            if (req.file) {
                bannerUrl = req.file.path;
            }

            const eventData = {
                ...req.body,
                bannerImage: bannerUrl,
            };

            const event = await this.eventService.createEvent(eventData, req.user.id);

            res.status(201).json({ success: true, event });
        } catch (error) {
            next(error);
        }
    };

    // -------- Update Event (text fields) --------
    updateEvent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const event = await this.eventService.updateEvent(req.params.id, req.body);
            res.json({ success: true, data: event });
        } catch (error) {
            next(error);
        }
    };

    // -------- Update Event Media (banner + video) --------
    updateEventMedia = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;

            const banner = req.files?.["banner"]?.[0];
            const video = req.files?.["video"]?.[0];

            const updatedData: any = {};

            if (banner) {
                updatedData.bannerImage = banner.path;
            }
            if (video) {
                updatedData.teaserVideo = video.path;
            }

            if (!banner && !video) {
                return res.status(400).json({ success: false, message: "No media uploaded" });
            }

            // Use EventService instead of repo.direct
            const updatedEvent = await this.eventService.updateEvent(id, updatedData);

            return res.json({ success: true, message: "Media updated", data: updatedEvent });
        } catch (error) {
            console.error("Media Update Error:", error);
            return res.status(500).json({ success: false, message: "Failed to update media" });
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
