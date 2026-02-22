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
exports.Invoice = exports.InvoiceStatus = void 0;
const typeorm_1 = require("typeorm");
const unit_entity_1 = require("../unit/unit.entity");
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["UNPAID"] = "UNPAID";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
let Invoice = class Invoice {
    id;
    unit;
    amount;
    billingMonth;
    dueDate;
    status;
    createdAt;
    items;
};
exports.Invoice = Invoice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Invoice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => unit_entity_1.Unit, (unit) => unit.invoices),
    __metadata("design:type", unit_entity_1.Unit)
], Invoice.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], Invoice.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Invoice.prototype, "billingMonth", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Invoice.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: InvoiceStatus.UNPAID,
    }),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Invoice.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], Invoice.prototype, "items", void 0);
exports.Invoice = Invoice = __decorate([
    (0, typeorm_1.Entity)()
], Invoice);
//# sourceMappingURL=invoice.entity.js.map