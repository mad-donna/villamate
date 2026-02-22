import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../unit/unit.entity';
import { Invoice, InvoiceStatus } from './invoice.entity';
import { CalculateBillingDto } from './dto/calculate-billing.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async calculate(dto: CalculateBillingDto) {
    const { buildingId, totalAmount, billingMonth, dueDate, exceptions } = dto;

    const units = await this.unitRepository.find({
      where: { building: { id: buildingId } },
    });

    if (units.length === 0) {
      throw new NotFoundException(`No units found for building ${buildingId}`);
    }

    let remainingAmount = totalAmount;
    const resultInvoices: Partial<Invoice>[] = [];
    const exceptionUnitIds = new Set(exceptions?.map((e) => e.unitId) || []);
    const normalUnits = units.filter((u) => !exceptionUnitIds.has(u.id));

    // 1. Process exceptions (Fixed amounts)
    if (exceptions) {
      for (const ex of exceptions) {
        const unit = units.find((u) => u.id === ex.unitId);
        if (!unit) continue;

        let unitAmount = 0;
        if (ex.amount !== undefined) {
          unitAmount = ex.amount;
        } else if (ex.ratio !== undefined) {
          unitAmount = totalAmount * ex.ratio;
        }

        resultInvoices.push({
          unit,
          amount: unitAmount,
          billingMonth,
          dueDate,
          status: InvoiceStatus.UNPAID,
          items: { base: '1/N (exception)' },
        });
        remainingAmount -= unitAmount;
      }
    }

    // 2. Process normal units (1/N)
    if (normalUnits.length > 0) {
      const perUnitAmount = remainingAmount / normalUnits.length;
      for (const unit of normalUnits) {
        resultInvoices.push({
          unit,
          amount: perUnitAmount,
          billingMonth,
          dueDate,
          status: InvoiceStatus.UNPAID,
          items: { base: '1/N' },
        });
      }
    }

    // 3. Save invoices
    const savedInvoices = await this.invoiceRepository.save(
      this.invoiceRepository.create(resultInvoices),
    );

    return savedInvoices;
  }

  async findUnpaid() {
    return this.invoiceRepository.find({
      where: { status: InvoiceStatus.UNPAID },
      relations: ['unit'],
    });
  }
}
