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
exports.Building = void 0;
const typeorm_1 = require("typeorm");
const unit_entity_1 = require("../unit/unit.entity");
let Building = class Building {
    id;
    name;
    address;
    units;
};
exports.Building = Building;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Building.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Building.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Building.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => unit_entity_1.Unit, (unit) => unit.building),
    __metadata("design:type", Array)
], Building.prototype, "units", void 0);
exports.Building = Building = __decorate([
    (0, typeorm_1.Entity)()
], Building);
//# sourceMappingURL=building.entity.js.map