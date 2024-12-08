import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AioAnalysisResponse } from "../../aio-analysis-response/entities/aio-analysis-response.entity";
import { ContactPerson } from "../../contact-person/entities/contact-person.entity";

@Entity({ name: 'company_information' })
export class CompanyInformation {
    @PrimaryGeneratedColumn()
    company_information_id: number;

    @OneToMany(() => AioAnalysisResponse, aio_analysis_response => aio_analysis_response.aio_analysis_response_id, { nullable: false })
    @JoinColumn({ name: "aio_analysis_response_id" })
    aio_analysis_response_id: AioAnalysisResponse;

    @Column({ type: "varchar", length: 255, nullable: false })
    company_name: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    industry: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    address: string;

    @CreateDateColumn({ nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', precision: null })
    created_at: Date;

    @CreateDateColumn({ nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: null })
    updated_at: Date;

    @OneToMany(() => ContactPerson, contact_person => contact_person.company_information_id, { nullable: false })
    contact_person: ContactPerson[];
}
