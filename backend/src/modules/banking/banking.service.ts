import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from './bank-account.entity';
import { Invoice, InvoiceStatus } from '../billing/invoice.entity';

@Injectable()
export class BankingService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async registerAccount(
    buildingId: number,
    accountNumber: string,
    bankName: string,
  ): Promise<BankAccount> {
    // PoC: Bypass database save for Building #1
    return Promise.resolve({
      id: 1,
      buildingId,
      accountNumber,
      bankName,
    } as BankAccount);
  }

  async getTransactions() {
    // Return mock transaction objects
    return Promise.resolve([
      {
        date: new Date().toISOString(),
        amount: 50000,
        type: 'DEPOSIT',
        description: 'Monthly Fee - Unit 101',
      },
      {
        date: new Date().toISOString(),
        amount: -10000,
        type: 'WITHDRAWAL',
        description: 'Cleaning Service',
      },
      {
        date: new Date().toISOString(),
        amount: 50000,
        type: 'DEPOSIT',
        description: 'Monthly Fee - Unit 102',
      },
    ]);
  }

  async settleInvoice(invoiceId: number) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    invoice.status = InvoiceStatus.PAID;
    await this.invoiceRepository.save(invoice);

    const total = Number(invoice.amount);
    const platformFee = total * 0.25;
    const villaAccount = total - platformFee;

    console.log(
      `[Settlement Mock] Invoice ID: ${invoice.id}, Total: ${total}, Villa Account: ${villaAccount}, Platform Fee: ${platformFee}`,
    );

    return {
      success: true,
      invoiceId: invoice.id,
      status: invoice.status,
    };
  }
}
