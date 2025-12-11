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
import { Review } from "./Review";
import { Report } from "./Report";
import { Waitlist } from "./Waitlist";
import { TicketType } from "./TicketType";
import { User } from "./User";


@Entity({ name: "events", synchronize: true })
export class Event {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    title: string;
    
    @Column("text")
    description: string;
    
    @Column({ type: "timestamptz" })
    dateTime: Date;
    
    @Column({ nullable: true })
    bannerImage: string;
    
    @Column({ nullable: true })
    teaserVideo: string;
    
    @Column()
    location: string;
    
    @Column()
    category: string;
    
    @Column()
    capacity: number;
    
    // -------- Organizer / Creator Relationship --------
    @ManyToOne(() => User, (user) => user.events)
    @JoinColumn({ name: "created_by" })
    creator: User;

    @Column({ name: "created_by" })
    createdBy: number;
    
    // -------- Timestamps --------
    @CreateDateColumn({ type: "timestamptz", name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
    updatedAt: Date;

    // -------- Relations --------
    @OneToMany(() => TicketType, (ticketType) => ticketType.event, { cascade: true })
    ticketTypes: TicketType[];

    @OneToMany(() => Booking, (booking) => booking.event)
    bookings: Booking[];

    @OneToMany(() => Review, (review) => review.event)
    reviews: Review[];

    @OneToMany(() => Report, (report) => report.event)
    reports: Report[];

    @OneToMany(() => Waitlist, (waitlist) => waitlist.event)
    waitlists: Waitlist[];
}
// Relationships:
// Event many → 1 User (Organizer)
// Event 1 → many TicketType
// Event 1 → many Booking
// Event 1 → many Review
// Event 1 → many Report (optional)
// Event 1 → many Waitlist (optional)