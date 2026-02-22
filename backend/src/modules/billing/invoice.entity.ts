import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Unit } from '../unit/unit.entity';

export enum InvoiceStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Unit, (unit) => unit.invoices)
  unit: Unit;

  @Column({ type: 'float' })
  amount: number;

  @Column()
  billingMonth: string; // e.g., '2026-02'

  @Column()
  dueDate: Date;

  @Column({
    type: 'varchar',
    default: InvoiceStatus.UNPAID,
  })
  status: InvoiceStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  items: any; // Breakdown of charges
}
