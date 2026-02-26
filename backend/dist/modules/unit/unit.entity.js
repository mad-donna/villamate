"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
const typeorm_1 = require("typeorm");
const building_entity_1 = require("../building/building.entity");
const user_entity_1 = require("../user/user.entity");
const invoice_entity_1 = require("../billing/invoice.entity");
let Unit = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _unitNumber_decorators;
    let _unitNumber_initializers = [];
    let _unitNumber_extraInitializers = [];
    let _building_decorators;
    let _building_initializers = [];
    let _building_extraInitializers = [];
    let _residents_decorators;
    let _residents_initializers = [];
    let _residents_extraInitializers = [];
    let _invoices_decorators;
    let _invoices_initializers = [];
    let _invoices_extraInitializers = [];
    var Unit = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
            _unitNumber_decorators = [(0, typeorm_1.Column)()];
            _building_decorators = [(0, typeorm_1.ManyToOne)(() => building_entity_1.Building, (building) => building.units)];
            _residents_decorators = [(0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.unit)];
            _invoices_decorators = [(0, typeorm_1.OneToMany)(() => invoice_entity_1.Invoice, (invoice) => invoice.unit)];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _unitNumber_decorators, { kind: "field", name: "unitNumber", static: false, private: false, access: { has: obj => "unitNumber" in obj, get: obj => obj.unitNumber, set: (obj, value) => { obj.unitNumber = value; } }, metadata: _metadata }, _unitNumber_initializers, _unitNumber_extraInitializers);
            __esDecorate(null, null, _building_decorators, { kind: "field", name: "building", static: false, private: false, access: { has: obj => "building" in obj, get: obj => obj.building, set: (obj, value) => { obj.building = value; } }, metadata: _metadata }, _building_initializers, _building_extraInitializers);
            __esDecorate(null, null, _residents_decorators, { kind: "field", name: "residents", static: false, private: false, access: { has: obj => "residents" in obj, get: obj => obj.residents, set: (obj, value) => { obj.residents = value; } }, metadata: _metadata }, _residents_initializers, _residents_extraInitializers);
            __esDecorate(null, null, _invoices_decorators, { kind: "field", name: "invoices", static: false, private: false, access: { has: obj => "invoices" in obj, get: obj => obj.invoices, set: (obj, value) => { obj.invoices = value; } }, metadata: _metadata }, _invoices_initializers, _invoices_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Unit = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        unitNumber = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _unitNumber_initializers, void 0));
        building = (__runInitializers(this, _unitNumber_extraInitializers), __runInitializers(this, _building_initializers, void 0));
        residents = (__runInitializers(this, _building_extraInitializers), __runInitializers(this, _residents_initializers, void 0));
        invoices = (__runInitializers(this, _residents_extraInitializers), __runInitializers(this, _invoices_initializers, void 0));
        constructor() {
            __runInitializers(this, _invoices_extraInitializers);
        }
    };
    return Unit = _classThis;
})();
exports.Unit = Unit;
