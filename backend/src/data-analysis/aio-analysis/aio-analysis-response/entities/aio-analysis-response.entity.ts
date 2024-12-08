import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DemographResponse } from "./demograph-response.entity";
import { PsychographResponse } from "./psychograph-response.entity";
import { CompanyInformation } from "../../company-information/entities/company-information.entity";
import { ContactPerson } from "../../contact-person/entities/contact-person.entity";

@Entity({ name: 'aio_analysis_response' })
export class AioAnalysisResponse {
    @PrimaryGeneratedColumn()
    aio_analysis_response_id: number;

    @ManyToOne(() => User, users => users.user_id, { nullable: false })
    @JoinColumn({ name: "user_id" })
    user_id: User;

    @Column({ nullable: false, type: 'varchar', length: 255 })
    additional_notes: string;

    @CreateDateColumn({ nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', precision: null })
    submitted_at: Date;

    @ManyToOne(() => CompanyInformation, company_information => company_information.aio_analysis_response_id)
    @JoinColumn({ name: "company_information_id" })
    company_information: CompanyInformation;

    @ManyToOne(() => ContactPerson, contact_person => contact_person.contact_person_id)
    @JoinColumn({ name: "contact_person_id" })
    contact_person: ContactPerson;

    @OneToMany(() => DemographResponse, demograph_response => demograph_response.aio_analysis_response_id)
    demograph_response: DemographResponse[];

    @OneToMany(() => PsychographResponse, psychograph_response => psychograph_response.aio_analysis_response_id)
    psychograph_response: PsychographResponse[];

}
