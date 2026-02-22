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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const unit_entity_1 = require("../unit/unit.entity");
const invoice_entity_1 = require("./invoice.entity");
let BillingService = class BillingService {
    unitRepository;
    invoiceRepository;
    constructor(unitRepository, invoiceRepository) {
        this.unitRepository = unitRepository;
        this.invoiceRepository = invoiceRepository;
    }
    async calculate(dto) {
        const { buildingId, totalAmount, billingMonth, dueDate, exceptions } = dto;
        const units = await this.unitRepository.find({
            where: { building: { id: buildingId } },
        });
        if (units.length === 0) {
            throw new common_1.NotFoundException(`No units found for building ${buildingId}`);
        }
        let remainingAmount = totalAmount;
        const resultInvoices = [];
        const exceptionUnitIds = new Set(exceptions?.map((e) => e.unitId) || []);
        const normalUnits = units.filter((u) => !exceptionUnitIds.has(u.id));
        if (exceptions) {
            for (const ex of exceptions) {
                const unit = units.find((u) => u.id === ex.unitId);
                if (!unit)
                    continue;
                let unitAmount = 0;
                if (ex.amount !== undefined) {
                    unitAmount = ex.amount;
                }
                else if (ex.ratio !== undefined) {
                    unitAmount = totalAmount * ex.ratio;
                }
                resultInvoices.push({
                    unit,
                    amount: unitAmount,
                    billingMonth,
                    dueDate,
                    status: invoice_entity_1.InvoiceStatus.UNPAID,
                    items: { base: '1/N (exception)' },
                });
                remainingAmount -= unitAmount;
            }
        }
        if (normalUnits.length > 0) {
            const perUnitAmount = remainingAmount / normalUnits.length;
            for (const unit of normalUnits) {
                resultInvoices.push({
                    unit,
                    amount: perUnitAmount,
                    billingMonth,
                    dueDate,
                    status: invoice_entity_1.InvoiceStatus.UNPAID,
                    items: { base: '1/N' },
                });
            }
        }
        const savedInvoices = await this.invoiceRepository.save(this.invoiceRepository.create(resultInvoices));
        return savedInvoices;
    }
    async findUnpaid() {
        return this.invoiceRepository.find({
            where: { status: invoice_entity_1.InvoiceStatus.UNPAID },
            relations: ['unit'],
        });
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(unit_entity_1.Unit)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BillingService);
//# sourceMappingURL=billing.service.js.map