import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Unit } from '../unit/unit.entity';

@Entity()
export class Building {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @OneToMany(() => Unit, (unit) => unit.building)
  units: Unit[];
}
