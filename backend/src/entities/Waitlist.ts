import { 
    Column, 
    CreateDateColumn, 
    Entity,
    ManyToOne, 
    JoinColumn,
    PrimaryGeneratedColumn, 
} from "typeorm";

import { WaitingStatus } from "../utils/enums";
import { User } from "./User";
import { Event } from "./Event";

@Entity({ name: "waitlists", synchronize: false })
export class Waitlist {
    @PrimaryGeneratedColumn()
    id: number;

    // ---- EVENT RELATION ----
    @ManyToOne(() => Event, (event) => event.waitlists)
    @JoinColumn({ name: "event_id" })
    event: Event;

    @Column({ name: "event_id" })
    eventId: number;

    // ---- USER RELATION ----
    @ManyToOne(() => User, (user) => user.waitlistEntries)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ name: "user_id" })
    userId: number;

    @Column()
    position: number;

    @Column({ 
        type: "enum",
        enum: WaitingStatus,
        default: WaitingStatus.WAITING,
    })
    status: WaitingStatus;

    @CreateDateColumn({ type: "timestamptz", name: "created_at" })
    createdAt: Date;
}


// Relationships:
// Waitlist many → 1 Event
// Waitlist many → 1 User