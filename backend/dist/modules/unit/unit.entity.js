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
exports.Unit = void 0;
const typeorm_1 = require("typeorm");
const building_entity_1 = require("../building/building.entity");
const user_entity_1 = require("../user/user.entity");
const invoice_entity_1 = require("../billing/invoice.entity");
let Unit = class Unit {
    id;
    unitNumber;
    building;
    residents;
    invoices;
};
exports.Unit = Unit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Unit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Unit.prototype, "unitNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => building_entity_1.Building, (building) => building.units),
    __metadata("design:type", building_entity_1.Building)
], Unit.prototype, "building", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.unit),
    __metadata("design:type", Array)
], Unit.prototype, "residents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => invoice_entity_1.Invoice, (invoice) => invoice.unit),
    __metadata("design:type", Array)
], Unit.prototype, "invoices", void 0);
exports.Unit = Unit = __decorate([
    (0, typeorm_1.Entity)()
], Unit);
//# sourceMappingURL=unit.entity.js.map