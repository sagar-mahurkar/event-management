import { 
    Column, 
    CreateDateColumn, 
    Entity,
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn, 
} from "typeorm";

import { BookingStatus } from "../utils/enums";
import { User } from "./User";
import { TicketType } from "./TicketType";
import { Event } from "./Event";

@Entity({ name: "bookings", synchronize: false })
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    // ---- USER RELATION ----
    @ManyToOne(() => User, (user) => user.bookings)
    @JoinColumn({ name: "booked_by" })
    user: User;

    @Column({ name: "booked_by" })
    bookedBy: number;

    // ---- EVENT RELATION ----
    @ManyToOne(() => Event, (event) => event.bookings)
    @JoinColumn({ name: "event_id" })
    event: Event;

    @Column({ name: "event_id" })
    eventId: number;

    // ---- TICKET TYPE RELATION ----
    @ManyToOne(() => TicketType, (ticketType) => ticketType.bookings, {
        eager: true,     // <-- ensures relation always loads
    })
    @JoinColumn({ name: "ticket_type_id" })
    ticketType: TicketType;

    @Column({ name: "ticket_type_id" })
    ticketTypeId: number;

    @Column()
    quantity: number;

    @Column("decimal", { precision: 10, scale: 2 })
    totalPrice: number;

    @Column()
    status: BookingStatus;

    @CreateDateColumn({ type: "timestamptz", name: "created_at" })
    createdAt: Date;
}
