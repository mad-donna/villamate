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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculateBillingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CalculateBillingDto {
    buildingId;
    totalAmount;
    billingMonth;
    dueDate;
    exceptions;
}
exports.CalculateBillingDto = CalculateBillingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'ID of the building' }),
    __metadata("design:type", Number)
], CalculateBillingDto.prototype, "buildingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500000, description: 'Total amount for the building' }),
    __metadata("design:type", Number)
], CalculateBillingDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-03', description: 'Billing month in YYYY-MM format' }),
    __metadata("design:type", String)
], CalculateBillingDto.prototype, "billingMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-03-31', description: 'Due date for payment' }),
    __metadata("design:type", Date)
], CalculateBillingDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        example: [{ unitId: 101, amount: 50000 }],
        description: 'Manual overrides for specific units',
    }),
    __metadata("design:type", Array)
], CalculateBillingDto.prototype, "exceptions", void 0);
//# sourceMappingURL=calculate-billing.dto.js.map