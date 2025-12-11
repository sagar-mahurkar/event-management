import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    CreateDateColumn, 
    JoinColumn
} from "typeorm";

import { User } from "./User";
import { OrganizerRequestStatus } from "../utils/enums";

@Entity({ name: "organizer_request", synchronize: true })
export class OrganizerRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.organizerRequests)
    @JoinColumn({name: "request_by"})
    requester: User;

    @Column({ name: "request_by" })
    requestedBy: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    message: string;

    @Column({ 
        type: "enum", 
        enum: OrganizerRequestStatus, 
        default: OrganizerRequestStatus.PENDING 
    }) 
    status: OrganizerRequestStatus;

    @CreateDateColumn()
    createdAt: Date;
}
