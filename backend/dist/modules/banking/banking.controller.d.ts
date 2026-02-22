import { BankingService } from './banking.service';
import { RegisterAccountDto } from './dto/register-account.dto';
import { SettleInvoiceDto } from './dto/settle-invoice.dto';
export declare class BankingController {
    private readonly bankingService;
    constructor(bankingService: BankingService);
    registerAccount(dto: RegisterAccountDto): Promise<import("./bank-account.entity").BankAccount>;
    getTransactions(accountId: number): Promise<{
        date: string;
        amount: number;
        type: string;
        description: string;
    }[]>;
    settleInvoice(dto: SettleInvoiceDto): Promise<{
        success: boolean;
        invoiceId: number;
        status: import("../billing/invoice.entity").InvoiceStatus.PAID;
    }>;
}
