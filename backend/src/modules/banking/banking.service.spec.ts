import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankingService } from './banking.service';
import { BankAccount } from './bank-account.entity';
import { Invoice, InvoiceStatus } from '../billing/invoice.entity';
import { NotFoundException } from '@nestjs/common';

describe('BankingService', () => {
  let service: BankingService;
  let bankAccountRepository: Repository<BankAccount>;
  let invoiceRepository: Repository<Invoice>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankingService,
        {
          provide: getRepositoryToken(BankAccount),
          useValue: {
            create: jest
              .fn()
              .mockImplementation(
                (dto: Partial<BankAccount>) => dto as BankAccount,
              ),
            save: jest
              .fn()
              .mockImplementation((dto: BankAccount) =>
                Promise.resolve({ id: 1, ...dto }),
              ),
          },
        },
        {
          provide: getRepositoryToken(Invoice),
          useValue: {
            findOne: jest.fn(),
            save: jest
              .fn()
              .mockImplementation((invoice: Invoice) =>
                Promise.resolve(invoice),
              ),
          },
        },
      ],
    }).compile();

    service = module.get<BankingService>(BankingService);
    bankAccountRepository = module.get<Repository<BankAccount>>(
      getRepositoryToken(BankAccount),
    );
    invoiceRepository = module.get<Repository<Invoice>>(
      getRepositoryToken(Invoice),
    );
  });

  it('should register a bank account', async () => {
    const dto = {
      buildingId: 1,
      accountNumber: '123-456-789',
      bankName: 'Shinhan Bank',
    };

    const result = await service.registerAccount(
      dto.buildingId,
      dto.accountNumber,
      dto.bankName,
    );

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    expect(result.accountNumber).toBe(dto.accountNumber);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(bankAccountRepository.create).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(bankAccountRepository.save).toHaveBeenCalled();
  });

  it('should return mock transactions', async () => {
    const result = await service.getTransactions(1);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('amount');
  });

  it('should settle an invoice and log split settlement', async () => {
    const invoiceId = 1;
    const mockInvoice = {
      id: invoiceId,
      amount: 20000,
      status: InvoiceStatus.UNPAID,
    } as Invoice;

    jest.spyOn(invoiceRepository, 'findOne').mockResolvedValue(mockInvoice);
    const consoleSpy = jest.spyOn(console, 'log');

    const result = await service.settleInvoice(invoiceId);

    expect(result.success).toBe(true);
    expect(result.status).toBe(InvoiceStatus.PAID);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(invoiceRepository.save).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `[Settlement Mock] Invoice ID: ${invoiceId}, Total: 20000, Villa Account: 15000, Platform Fee: 5000`,
      ),
    );
  });

  it('should throw NotFoundException if invoice not found', async () => {
    jest.spyOn(invoiceRepository, 'findOne').mockResolvedValue(null);

    await expect(service.settleInvoice(999)).rejects.toThrow(NotFoundException);
  });
});
