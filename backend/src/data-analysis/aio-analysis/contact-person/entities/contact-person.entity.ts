import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyInformation } from "../../company-information/entities/company-information.entity";

@Entity({ name: 'contact_person' })
export class ContactPerson {
    @PrimaryGeneratedColumn()
    contact_person_id: number;

    @Column({ type: "varchar", length: 255, nullable: false })
    full_name: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    email_address: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    position_or_title: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    phone_number: string;

    @CreateDateColumn({ nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', precision: null })
    created_at: Date;

    @CreateDateColumn({ nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: null })
    updated_at: Date;

    @ManyToOne(() => CompanyInformation, company_information => company_information.company_information_id, { nullable: false })
    @JoinColumn({ name: "company_information_id" })
    company_information_id: CompanyInformation;
}
