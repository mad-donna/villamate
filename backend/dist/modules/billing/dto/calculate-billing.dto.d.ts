export declare class CalculateBillingDto {
    buildingId: number;
    totalAmount: number;
    billingMonth: string;
    dueDate: Date;
    exceptions?: {
        unitId: number;
        amount?: number;
        ratio?: number;
    }[];
}
