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
exports.BankAccount = void 0;
const typeorm_1 = require("typeorm");
const building_entity_1 = require("../building/building.entity");
let BankAccount = class BankAccount {
    id;
    buildingId;
    building;
    accountNumber;
    bankName;
};
exports.BankAccount = BankAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BankAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BankAccount.prototype, "buildingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => building_entity_1.Building),
    (0, typeorm_1.JoinColumn)({ name: 'buildingId' }),
    __metadata("design:type", building_entity_1.Building)
], BankAccount.prototype, "building", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BankAccount.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BankAccount.prototype, "bankName", void 0);
exports.BankAccount = BankAccount = __decorate([
    (0, typeorm_1.Entity)()
], BankAccount);
//# sourceMappingURL=bank-account.entity.js.map