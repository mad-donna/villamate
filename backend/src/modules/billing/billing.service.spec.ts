import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingService } from './billing.service';
import { Unit } from '../unit/unit.entity';
import { Invoice, InvoiceStatus } from './invoice.entity';

describe('BillingService', () => {
  let service: BillingService;
  let unitRepository: Repository<Unit>;
  let invoiceRepository: Repository<Invoice>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: getRepositoryToken(Unit),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Invoice),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((dto) => Promise.resolve(dto)),
          },
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    unitRepository = module.get<Repository<Unit>>(getRepositoryToken(Unit));
    invoiceRepository = module.get<Repository<Invoice>>(
      getRepositoryToken(Invoice),
    );
  });

  it('should calculate 1/N for all units without exceptions', async () => {
    const units = [{ id: 1 }, { id: 2 }, { id: 3 }] as Unit[];
    jest.spyOn(unitRepository, 'find').mockResolvedValue(units);

    const dto = {
      buildingId: 1,
      totalAmount: 300000,
      billingMonth: '2026-02',
      dueDate: new Date('2026-03-01'),
    };

    const result = await service.calculate(dto);

    expect(result).toHaveLength(3);
    expect(result[0].amount).toBe(100000);
    expect(result[1].amount).toBe(100000);
    expect(result[2].amount).toBe(100000);
  });

  it('should handle exceptions with fixed amounts and ratios', async () => {
    const units = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] as Unit[];
    jest.spyOn(unitRepository, 'find').mockResolvedValue(units);

    const dto = {
      buildingId: 1,
      totalAmount: 400000,
      billingMonth: '2026-02',
      dueDate: new Date('2026-03-01'),
      exceptions: [
        { unitId: 1, amount: 100000 }, // Unit 1: 100k
        { unitId: 2, ratio: 0.25 }, // Unit 2: 100k (0.25 * 400k)
      ],
    };

    // Remaining: 400k - 100k - 100k = 200k. Normal units: 3, 4. Each: 100k.

    const result = await service.calculate(dto);

    expect(result).toHaveLength(4);
    const u1 = result.find((i) => (i.unit as any).id === 1);
    const u2 = result.find((i) => (i.unit as any).id === 2);
    const u3 = result.find((i) => (i.unit as any).id === 3);
    const u4 = result.find((i) => (i.unit as any).id === 4);

    expect(u1.amount).toBe(100000);
    expect(u2.amount).toBe(100000);
    expect(u3.amount).toBe(100000);
    expect(u4.amount).toBe(100000);
  });
});
