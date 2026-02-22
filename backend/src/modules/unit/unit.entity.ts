import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Building } from '../building/building.entity';
import { User } from '../user/user.entity';
import { Invoice } from '../billing/invoice.entity';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  unitNumber: string;

  @ManyToOne(() => Building, (building) => building.units)
  building: Building;

  @OneToMany(() => User, (user) => user.unit)
  residents: User[];

  @OneToMany(() => Invoice, (invoice) => invoice.unit)
  invoices: Invoice[];
}
