import { Building } from '../building/building.entity';
export declare class BankAccount {
    id: number;
    buildingId: number;
    building: Building;
    accountNumber: string;
    bankName: string;
}
