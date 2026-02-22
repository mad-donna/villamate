import { Unit } from '../unit/unit.entity';
export declare enum InvoiceStatus {
    PAID = "PAID",
    UNPAID = "UNPAID"
}
export declare class Invoice {
    id: number;
    unit: Unit;
    amount: number;
    billingMonth: string;
    dueDate: Date;
    status: InvoiceStatus;
    createdAt: Date;
    items: any;
}
