import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../billing/invoice.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async remindUnpaid() {
    const unpaidInvoices = await this.invoiceRepository.find({
      where: { status: InvoiceStatus.UNPAID },
      relations: ['unit'],
    });

    this.logger.log(`Found ${unpaidInvoices.length} unpaid invoices.`);

    for (const invoice of unpaidInvoices) {
      // Mock notification (Alimtalk/Push)
      this.logger.log(
        `[MOCK NOTIFICATION] Sent reminder to Unit ${invoice.unit.unitNumber} for ${invoice.amount} KRW (Due: ${invoice.dueDate})`,
      );
    }

    return { sent: unpaidInvoices.length };
  }
}
