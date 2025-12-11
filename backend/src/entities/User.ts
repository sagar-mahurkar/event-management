import { 
    Column, 
    CreateDateColumn, 
    Entity, 
    OneToMany, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn
} from "typeorm";

import { UserRole, UserStatus } from "../utils/enums";
import { Event } from "./Event";
import { Booking } from "./Booking";
import { Review } from "./Review";
import { Report } from "./Report";
import { Waitlist } from "./Waitlist"
import { OrganizerRequest } from "./OrganizerRequest";

@Entity({ name: "users", synchronize: true })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.ATTENDEE
    })
    role: UserRole;

    @Column({
        type: "enum",
        enum: UserStatus,
        default: UserStatus.ACTIVE})
    status: UserStatus;

    @Column({ nullable: true })
    login_otp: number;

    @Column({ type: "timestamptz", nullable: true })
    login_otp_expiry: Date;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    @OneToMany(() => OrganizerRequest, (organizerRequest) => organizerRequest.requester)
    organizerRequests: OrganizerRequest[];

    @OneToMany(() => Event, (event) => event.creator)
    events: Event[];

    @OneToMany(() => Booking, (booking) => booking.user)
    bookings: Booking[];

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[];

    @OneToMany(() => Report, (report) => report.user)
    reports: Report[];

    @OneToMany(() => Waitlist, waitlist => waitlist.user)
    waitlistEntries: Waitlist[];
}

// Relationships:
// User (Admin) 1 → many Reports
// User (Organizer) 1 → many Event
// User (Attendee) 1 → many Booking
// User (Attendee) 1 → many Review



