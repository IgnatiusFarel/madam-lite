import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AioAnalysisResponse } from "./aio-analysis-response.entity";

@Entity({ name: 'demograph_response' })
export class DemographResponse {
    @PrimaryGeneratedColumn()
    demograph_response_id: number;

    @ManyToOne(() => AioAnalysisResponse, aio_analysis_response => aio_analysis_response.aio_analysis_response_id, { nullable: false })
    @JoinColumn({ name: "aio_analysis_response_id" })
    aio_analysis_response_id: AioAnalysisResponse;

    @Column({ type: "varchar", length: 255, nullable: false })
    parameter_name: string;
    
    @Column({ type: "varchar", length: 255, nullable: false })
    custom_result_parameter: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    selected_value: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    result_value: string;
}
