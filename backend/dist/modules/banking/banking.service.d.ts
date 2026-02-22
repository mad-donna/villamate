import { Repository } from 'typeorm';
import { BankAccount } from './bank-account.entity';
import { Invoice, InvoiceStatus } from '../billing/invoice.entity';
export declare class BankingService {
    private readonly bankAccountRepository;
    private readonly invoiceRepository;
    constructor(bankAccountRepository: Repository<BankAccount>, invoiceRepository: Repository<Invoice>);
    registerAccount(buildingId: number, accountNumber: string, bankName: string): Promise<BankAccount>;
    getTransactions(): Promise<{
        date: string;
        amount: number;
        type: string;
        description: string;
    }[]>;
    settleInvoice(invoiceId: number): Promise<{
        success: boolean;
        invoiceId: number;
        status: InvoiceStatus.PAID;
    }>;
}
