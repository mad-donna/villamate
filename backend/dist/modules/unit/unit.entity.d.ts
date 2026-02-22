import { Building } from '../building/building.entity';
import { User } from '../user/user.entity';
import { Invoice } from '../billing/invoice.entity';
export declare class Unit {
    id: number;
    unitNumber: string;
    building: Building;
    residents: User[];
    invoices: Invoice[];
}
