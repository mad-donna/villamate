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
exports.RegisterAccountDto = void 0;
const swagger_1 = require("@nestjs/swagger");
let RegisterAccountDto = (() => {
    let _buildingId_decorators;
    let _buildingId_initializers = [];
    let _buildingId_extraInitializers = [];
    let _accountNumber_decorators;
    let _accountNumber_initializers = [];
    let _accountNumber_extraInitializers = [];
    let _bankName_decorators;
    let _bankName_initializers = [];
    let _bankName_extraInitializers = [];
    return class RegisterAccountDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _buildingId_decorators = [(0, swagger_1.ApiProperty)({ example: 1, description: 'ID of the building' })];
            _accountNumber_decorators = [(0, swagger_1.ApiProperty)({ example: '110-123-456789', description: 'Bank account number' })];
            _bankName_decorators = [(0, swagger_1.ApiProperty)({ example: 'Shinhan Bank', description: 'Name of the bank' })];
            __esDecorate(null, null, _buildingId_decorators, { kind: "field", name: "buildingId", static: false, private: false, access: { has: obj => "buildingId" in obj, get: obj => obj.buildingId, set: (obj, value) => { obj.buildingId = value; } }, metadata: _metadata }, _buildingId_initializers, _buildingId_extraInitializers);
            __esDecorate(null, null, _accountNumber_decorators, { kind: "field", name: "accountNumber", static: false, private: false, access: { has: obj => "accountNumber" in obj, get: obj => obj.accountNumber, set: (obj, value) => { obj.accountNumber = value; } }, metadata: _metadata }, _accountNumber_initializers, _accountNumber_extraInitializers);
            __esDecorate(null, null, _bankName_decorators, { kind: "field", name: "bankName", static: false, private: false, access: { has: obj => "bankName" in obj, get: obj => obj.bankName, set: (obj, value) => { obj.bankName = value; } }, metadata: _metadata }, _bankName_initializers, _bankName_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        buildingId = __runInitializers(this, _buildingId_initializers, void 0);
        accountNumber = (__runInitializers(this, _buildingId_extraInitializers), __runInitializers(this, _accountNumber_initializers, void 0));
        bankName = (__runInitializers(this, _accountNumber_extraInitializers), __runInitializers(this, _bankName_initializers, void 0));
        constructor() {
            __runInitializers(this, _bankName_extraInitializers);
        }
    };
})();
exports.RegisterAccountDto = RegisterAccountDto;
