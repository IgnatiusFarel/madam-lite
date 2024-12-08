import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Demograph } from './demograph.entity';

@Entity({ name: 'demograph_option' })
export class DemographOption {
  @PrimaryGeneratedColumn()
  demograph_option_id: number;

  @ManyToOne(() => Demograph, demograph => demograph.list_of_options, { nullable: false })
  @JoinColumn({ name: "demograph_id" })
  demograph_id: Demograph;

  @Column({ nullable: false })
  option_value: string;

  @Column({ nullable: true })
  result_value: string;

  @CreateDateColumn({ nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', precision: null })
  created_at: Date;

  @CreateDateColumn({ nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: null })
  updated_at: Date;

}