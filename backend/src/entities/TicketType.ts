import { 
    Column, 
    CreateDateColumn, 
    Entity, 
    OneToMany, 
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn, 
    UpdateDateColumn
} from "typeorm";

import { Booking } from "./Booking";
import { Event } from "./Event";
import { TicketCategory } from "../utils/enums"

@Entity({ name: "ticket_types", synchronize: false })
export class TicketType {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Event, (event) => event.ticketTypes)
    @JoinColumn({ name: "event_id" })
    event: Event;

    @Column({ name: "event_id" })
    eventId: number;

    @Column({
        type: "enum",
        enum: TicketCategory,
        default: TicketCategory.REGULAR
    })
    type: TicketCategory; // enum: VIP, Regular

    @Column("decimal", { precision: 10, scale: 2 })
    price: number;

    @Column()
    limit: number;

    @Column({ type: "jsonb", nullable: true })
    dynamicPricingRules: any; // optional JSON field for dynamic pricing rules

    @CreateDateColumn({ type: "timestamptz", name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
    updatedAt: Date;

    @OneToMany(() => Booking, (booking) => booking.ticketType)
    bookings: Booking[];
}

// Relationships:
// TicketType many → 1 Event
// TicketType 1 → many Booking