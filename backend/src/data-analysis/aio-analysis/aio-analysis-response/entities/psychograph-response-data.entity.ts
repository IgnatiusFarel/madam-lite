import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PsychographResponse } from "./psychograph-response.entity";

@Entity({ name: 'psychograph_response_data' })
export class PsychographResponseData {

    @PrimaryGeneratedColumn()
    psychograph_response_data_id: number;

    @ManyToOne(() => PsychographResponse, psychograph_response => psychograph_response.psychograph_response_id, { nullable: false })
    @JoinColumn({ name: "psychograph_response_id" })
    psychograph_response_id: PsychographResponse;

    @Column({ type: "varchar", length: 255, nullable: false })
    selected_option: string;
}
