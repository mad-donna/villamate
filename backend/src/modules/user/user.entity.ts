import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Unit } from '../unit/unit.entity';

export enum UserRole {
  RESIDENT = 'RESIDENT',
  REPRESENTATIVE = 'REPRESENTATIVE',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    default: UserRole.RESIDENT,
  })
  role: UserRole;

  @ManyToOne(() => Unit, (unit) => unit.residents, { nullable: true })
  unit: Unit;
}
