import { BillingService } from './billing.service';
import { CalculateBillingDto } from './dto/calculate-billing.dto';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    calculate(calculateBillingDto: CalculateBillingDto): Promise<import("./invoice.entity").Invoice[]>;
    findUnpaid(): Promise<import("./invoice.entity").Invoice[]>;
}
