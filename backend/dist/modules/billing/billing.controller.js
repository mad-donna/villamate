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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const billing_service_1 = require("./billing.service");
const calculate_billing_dto_1 = require("./dto/calculate-billing.dto");
let BillingController = class BillingController {
    billingService;
    constructor(billingService) {
        this.billingService = billingService;
    }
    async calculate(calculateBillingDto) {
        return this.billingService.calculate(calculateBillingDto);
    }
    async findUnpaid() {
        return this.billingService.findUnpaid();
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate monthly billing for a building' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_billing_dto_1.CalculateBillingDto]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "calculate", null);
__decorate([
    (0, common_1.Get)('unpaid'),
    (0, swagger_1.ApiOperation)({ summary: 'Find all unpaid invoices' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "findUnpaid", null);
exports.BillingController = BillingController = __decorate([
    (0, swagger_1.ApiTags)('billing'),
    (0, common_1.Controller)('api/v1/billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map