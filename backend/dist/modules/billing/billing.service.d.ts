import { Repository } from 'typeorm';
import { Unit } from '../unit/unit.entity';
import { Invoice } from './invoice.entity';
import { CalculateBillingDto } from './dto/calculate-billing.dto';
export declare class BillingService {
    private readonly unitRepository;
    private readonly invoiceRepository;
    constructor(unitRepository: Repository<Unit>, invoiceRepository: Repository<Invoice>);
    calculate(dto: CalculateBillingDto): Promise<Invoice[]>;
    findUnpaid(): Promise<Invoice[]>;
}
