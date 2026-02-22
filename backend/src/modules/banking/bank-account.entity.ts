import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Building } from '../building/building.entity';

@Entity()
export class BankAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  buildingId: number;

  @ManyToOne(() => Building)
  @JoinColumn({ name: 'buildingId' })
  building: Building;

  @Column()
  accountNumber: string;

  @Column()
  bankName: string;
}
