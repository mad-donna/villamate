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
exports.BankingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const banking_service_1 = require("./banking.service");
const register_account_dto_1 = require("./dto/register-account.dto");
const settle_invoice_dto_1 = require("./dto/settle-invoice.dto");
let BankingController = class BankingController {
    bankingService;
    constructor(bankingService) {
        this.bankingService = bankingService;
    }
    async registerAccount(dto) {
        return this.bankingService.registerAccount(dto.buildingId, dto.accountNumber, dto.bankName);
    }
    async getTransactions(accountId) {
        return this.bankingService.getTransactions();
    }
    async settleInvoice(dto) {
        return this.bankingService.settleInvoice(dto.invoiceId);
    }
};
exports.BankingController = BankingController;
__decorate([
    (0, common_1.Post)('account'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a mock building account' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_account_dto_1.RegisterAccountDto]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "registerAccount", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get mock transactions for an account' }),
    __param(0, (0, common_1.Query)('accountId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('settlement'),
    (0, swagger_1.ApiOperation)({ summary: 'Mock Webhook for invoice settlement' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settle_invoice_dto_1.SettleInvoiceDto]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "settleInvoice", null);
exports.BankingController = BankingController = __decorate([
    (0, swagger_1.ApiTags)('banking'),
    (0, common_1.Controller)('api/v1/banking'),
    __metadata("design:paramtypes", [banking_service_1.BankingService])
], BankingController);
//# sourceMappingURL=banking.controller.js.map