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

@Entity({ name: "reviews", synchronize: false })
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.reviews)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ name: "user_id" })
    userId: number;

    @ManyToOne(() => Event, (event) => event.reviews)
    @JoinColumn({ name: "event_id" })
    event: Event;

    @Column({ name: "event_id" })
    eventId: number;

    @Column("decimal", { precision: 3, scale: 2 })
    rating: number;

    @Column({ nullable: true })
    reviewText: string;

    @Column({ nullable: true })
    media: string;

    @CreateDateColumn({ type: "timestamptz", name: "created_at" })
    createdAt: Date;
}


// Relationships:
// Review many → 1 User
// Review many → 1 Event