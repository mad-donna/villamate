"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bank_account_entity_1 = require("./bank-account.entity");
const invoice_entity_1 = require("../billing/invoice.entity");
let BankingService = class BankingService {
    bankAccountRepository;
    invoiceRepository;
    constructor(bankAccountRepository, invoiceRepository) {
        this.bankAccountRepository = bankAccountRepository;
        this.invoiceRepository = invoiceRepository;
    }
    async registerAccount(buildingId, accountNumber, bankName) {
        return Promise.resolve({
            id: 1,
            buildingId,
            accountNumber,
            bankName,
        });
    }
    async getTransactions() {
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
    async settleInvoice(invoiceId) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id: invoiceId },
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }
        invoice.status = invoice_entity_1.InvoiceStatus.PAID;
        await this.invoiceRepository.save(invoice);
        const total = Number(invoice.amount);
        const platformFee = total * 0.25;
        const villaAccount = total - platformFee;
        console.log(`[Settlement Mock] Invoice ID: ${invoice.id}, Total: ${total}, Villa Account: ${villaAccount}, Platform Fee: ${platformFee}`);
        return {
            success: true,
            invoiceId: invoice.id,
            status: invoice.status,
        };
    }
};
exports.BankingService = BankingService;
exports.BankingService = BankingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccount)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BankingService);
//# sourceMappingURL=banking.service.js.map