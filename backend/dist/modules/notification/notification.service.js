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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("../billing/invoice.entity");
let NotificationService = NotificationService_1 = class NotificationService {
    invoiceRepository;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    async remindUnpaid() {
        const unpaidInvoices = await this.invoiceRepository.find({
            where: { status: invoice_entity_1.InvoiceStatus.UNPAID },
            relations: ['unit'],
        });
        this.logger.log(`Found ${unpaidInvoices.length} unpaid invoices.`);
        for (const invoice of unpaidInvoices) {
            this.logger.log(`[MOCK NOTIFICATION] Sent reminder to Unit ${invoice.unit.unitNumber} for ${invoice.amount} KRW (Due: ${invoice.dueDate})`);
        }
        return { sent: unpaidInvoices.length };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationService);
//# sourceMappingURL=notification.service.js.map