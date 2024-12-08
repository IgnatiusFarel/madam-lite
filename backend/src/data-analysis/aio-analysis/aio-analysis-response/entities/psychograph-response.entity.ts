import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AioAnalysisResponse } from "./aio-analysis-response.entity";
import { PsychographResponseData } from "./psychograph-response-data.entity";

@Entity({ name: 'psychograph_response' })
export class PsychographResponse {
    @PrimaryGeneratedColumn()
    psychograph_response_id: number;

    @ManyToOne(() => AioAnalysisResponse, aio_analysis_response => aio_analysis_response.aio_analysis_response_id, { nullable: false })
    @JoinColumn({ name: "aio_analysis_response_id" })
    aio_analysis_response_id: AioAnalysisResponse;

    @Column({ type: 'enum', enum: ['activity', 'interest', 'opinion'], nullable: false })
    type: string;

    @Column({type: 'int', nullable: false})
    total_selected_option: number;

    @Column({type: 'int', nullable: false})
    total_option: number;

    @OneToMany(() => PsychographResponseData, psychograph_response_data => psychograph_response_data.psychograph_response_id)
    psychograph_response_data: PsychographResponseData[];
}
