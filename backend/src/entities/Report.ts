import { 
    Column, 
    CreateDateColumn, 
    Entity,
    ManyToOne, 
    JoinColumn,
    PrimaryGeneratedColumn, 
} from "typeorm";

import { User } from "./User";
import { Event } from "./Event";
import { ReportStatus } from "../utils/enums";

@Entity({ name: "reports", synchronize: false })
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    // ---- EVENT RELATION ----
    @ManyToOne(() => Event, (event) => event.reports)
    @JoinColumn({ name: "event_id" })
    event: Event;

    @Column({ name: "event_id" })
    eventId: number;

    // ---- USER RELATION ----
    @ManyToOne(() => User, (user) => user.reports)
    @JoinColumn({ name: "reported_by" })
    user: User;

    @Column({ name: "reported_by" })
    reportedBy: number;

    @Column()
    reason: string;

    @Column({
        type: "enum",
        enum: ReportStatus,
        default: ReportStatus.PENDING,
    })
    status: ReportStatus;

    @CreateDateColumn({ type: "timestamptz", name: "created_at" })
    createdAt: Date;
}

// Relationships:
// Report many → 1 Event
// Report many → 1 User