import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'psychograph' })
export class Psychograph {

    @PrimaryGeneratedColumn()
    psychograph_id: number;

    @Column({
        type: 'enum',
        enum: ['activity', 'interest', 'opinion'],
        nullable: false
    })
    type: string;

    @Column()
    option_value: string;

    @CreateDateColumn({ nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', precision: null })
    created_at: Date;

    @UpdateDateColumn({ nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP()', precision: null })
    updated_at: Date;
}
