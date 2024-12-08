import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity({ name: 'activity_history' })
export class ActivityHistory {

    @PrimaryGeneratedColumn()
    activity_history_id: number;

    @ManyToOne(() => User, users => users.user_id, { nullable: false })
    @JoinColumn({ name: "user_id" })
    user_id: User;

    @Column({ type: "varchar", length: 255, nullable: false })
    activity: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: false, precision: null })
    created_at: Date;
}
