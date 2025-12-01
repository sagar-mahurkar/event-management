import { EventManagementDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { Event } from "../entities/Event";
import { Booking } from "../entities/Booking";
import { Report } from "../entities/Report";
import { TicketType } from "../entities/TicketType";
import { Waitlist } from "../entities/Waitlist";
import { Review } from "../entities/Review";
import { OrganizerRequest } from "../entities/OrganizerRequest"

const userRepo = EventManagementDataSource.getRepository(User);
const eventRepo = EventManagementDataSource.getRepository(Event);
const bookingRepo = EventManagementDataSource.getRepository(Booking);
const reportRepo = EventManagementDataSource.getRepository(Report);
const ticketTypeRepo = EventManagementDataSource.getRepository(TicketType);
const waitlistRepo = EventManagementDataSource.getRepository(Waitlist);
const reviewRepo = EventManagementDataSource.getRepository(Review);
const organizerRequestRepo = EventManagementDataSource.getRepository(OrganizerRequest)

export { userRepo, eventRepo, bookingRepo, reportRepo, ticketTypeRepo, waitlistRepo, reviewRepo, organizerRequestRepo }