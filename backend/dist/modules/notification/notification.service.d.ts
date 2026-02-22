import { Repository } from 'typeorm';
import { Invoice } from '../billing/invoice.entity';
export declare class NotificationService {
    private readonly invoiceRepository;
    private readonly logger;
    constructor(invoiceRepository: Repository<Invoice>);
    remindUnpaid(): Promise<{
        sent: number;
    }>;
}
