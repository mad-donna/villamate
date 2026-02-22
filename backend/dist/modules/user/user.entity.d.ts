import { Unit } from '../unit/unit.entity';
export declare enum UserRole {
    RESIDENT = "RESIDENT",
    REPRESENTATIVE = "REPRESENTATIVE"
}
export declare class User {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    unit: Unit;
}
