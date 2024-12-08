import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DemographOption } from './demograph-option.entity';

@Entity({ name: 'demograph' })
export class Demograph {
    @PrimaryGeneratedColumn()
    demograph_id: number;

    @Column({ nullable: false, type: 'varchar', length: 255, unique: true })
    parameter_name: string;

    @Column({ nullable: true, type: 'varchar', length: 255 })
    custom_result_parameter: string;

    @CreateDateColumn({ nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', precision: null })
    created_at: Date;

    @UpdateDateColumn({ nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP()', precision: null })
    updated_at: Date;

    @OneToMany(() => DemographOption, list_of_options => list_of_options.demograph_id)
    list_of_options: DemographOption[];
}
