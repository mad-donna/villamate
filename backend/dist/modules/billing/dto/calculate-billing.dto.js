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
exports.CalculateBillingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
let CalculateBillingDto = (() => {
    let _buildingId_decorators;
    let _buildingId_initializers = [];
    let _buildingId_extraInitializers = [];
    let _totalAmount_decorators;
    let _totalAmount_initializers = [];
    let _totalAmount_extraInitializers = [];
    let _billingMonth_decorators;
    let _billingMonth_initializers = [];
    let _billingMonth_extraInitializers = [];
    let _dueDate_decorators;
    let _dueDate_initializers = [];
    let _dueDate_extraInitializers = [];
    let _exceptions_decorators;
    let _exceptions_initializers = [];
    let _exceptions_extraInitializers = [];
    return class CalculateBillingDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _buildingId_decorators = [(0, swagger_1.ApiProperty)({ example: 1, description: 'ID of the building' })];
            _totalAmount_decorators = [(0, swagger_1.ApiProperty)({ example: 500000, description: 'Total amount for the building' })];
            _billingMonth_decorators = [(0, swagger_1.ApiProperty)({ example: '2026-03', description: 'Billing month in YYYY-MM format' })];
            _dueDate_decorators = [(0, swagger_1.ApiProperty)({ example: '2026-03-31', description: 'Due date for payment' })];
            _exceptions_decorators = [(0, swagger_1.ApiProperty)({
                    required: false,
                    example: [{ unitId: 101, amount: 50000 }],
                    description: 'Manual overrides for specific units',
                })];
            __esDecorate(null, null, _buildingId_decorators, { kind: "field", name: "buildingId", static: false, private: false, access: { has: obj => "buildingId" in obj, get: obj => obj.buildingId, set: (obj, value) => { obj.buildingId = value; } }, metadata: _metadata }, _buildingId_initializers, _buildingId_extraInitializers);
            __esDecorate(null, null, _totalAmount_decorators, { kind: "field", name: "totalAmount", static: false, private: false, access: { has: obj => "totalAmount" in obj, get: obj => obj.totalAmount, set: (obj, value) => { obj.totalAmount = value; } }, metadata: _metadata }, _totalAmount_initializers, _totalAmount_extraInitializers);
            __esDecorate(null, null, _billingMonth_decorators, { kind: "field", name: "billingMonth", static: false, private: false, access: { has: obj => "billingMonth" in obj, get: obj => obj.billingMonth, set: (obj, value) => { obj.billingMonth = value; } }, metadata: _metadata }, _billingMonth_initializers, _billingMonth_extraInitializers);
            __esDecorate(null, null, _dueDate_decorators, { kind: "field", name: "dueDate", static: false, private: false, access: { has: obj => "dueDate" in obj, get: obj => obj.dueDate, set: (obj, value) => { obj.dueDate = value; } }, metadata: _metadata }, _dueDate_initializers, _dueDate_extraInitializers);
            __esDecorate(null, null, _exceptions_decorators, { kind: "field", name: "exceptions", static: false, private: false, access: { has: obj => "exceptions" in obj, get: obj => obj.exceptions, set: (obj, value) => { obj.exceptions = value; } }, metadata: _metadata }, _exceptions_initializers, _exceptions_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        buildingId = __runInitializers(this, _buildingId_initializers, void 0);
        totalAmount = (__runInitializers(this, _buildingId_extraInitializers), __runInitializers(this, _totalAmount_initializers, void 0));
        billingMonth = (__runInitializers(this, _totalAmount_extraInitializers), __runInitializers(this, _billingMonth_initializers, void 0)); // 'YYYY-MM'
        dueDate = (__runInitializers(this, _billingMonth_extraInitializers), __runInitializers(this, _dueDate_initializers, void 0));
        exceptions = (__runInitializers(this, _dueDate_extraInitializers), __runInitializers(this, _exceptions_initializers, void 0));
        constructor() {
            __runInitializers(this, _exceptions_extraInitializers);
        }
    };
})();
exports.CalculateBillingDto = CalculateBillingDto;
