// src/controllers/TicketController.ts
import { Request, Response, NextFunction } from "express";
import { TicketService } from "../services/TicketService";

export class TicketController {
    private ticketService = new TicketService();

    // ---------------- GET TICKETS FOR EVENT ----------------
    getEventTickets = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const eventId = Number(req.params.eventId);
            const tickets = await this.ticketService.getEventTickets(eventId);
            res.json({ success: true, data: tickets });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- CREATE TICKET TYPE ----------------
    createTicketType = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const eventId = Number(req.params.eventId);
            const ticketData = req.body;
            const ticket = await this.ticketService.createTicketType(eventId, ticketData);
            res.status(201).json({ success: true, data: ticket });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- UPDATE TICKET TYPE ----------------
    updateTicketType = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ticketTypeId = Number(req.params.id);
            const updateData = req.body;
            const ticket = await this.ticketService.updateTicketType(ticketTypeId, updateData);
            res.json({ success: true, data: ticket });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- DELETE TICKET TYPE ----------------
    deleteTicketType = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ticketTypeId = Number(req.params.id);
            await this.ticketService.deleteTicketType(ticketTypeId);
            res.json({ success: true, message: "Ticket type deleted successfully" });
        } catch (error) {
            next(error);
        }
    };
}
