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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const invoice_entity_1 = require("./invoice.entity");
let BillingService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var BillingService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            BillingService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        unitRepository;
        invoiceRepository;
        constructor(unitRepository, invoiceRepository) {
            this.unitRepository = unitRepository;
            this.invoiceRepository = invoiceRepository;
        }
        async calculate(dto) {
            const { buildingId, totalAmount, billingMonth, dueDate, exceptions } = dto;
            const units = await this.unitRepository.find({
                where: { building: { id: buildingId } },
            });
            if (units.length === 0) {
                throw new common_1.NotFoundException(`No units found for building ${buildingId}`);
            }
            let remainingAmount = totalAmount;
            const resultInvoices = [];
            const exceptionUnitIds = new Set(exceptions?.map((e) => e.unitId) || []);
            const normalUnits = units.filter((u) => !exceptionUnitIds.has(u.id));
            // 1. Process exceptions (Fixed amounts)
            if (exceptions) {
                for (const ex of exceptions) {
                    const unit = units.find((u) => u.id === ex.unitId);
                    if (!unit)
                        continue;
                    let unitAmount = 0;
                    if (ex.amount !== undefined) {
                        unitAmount = ex.amount;
                    }
                    else if (ex.ratio !== undefined) {
                        unitAmount = totalAmount * ex.ratio;
                    }
                    resultInvoices.push({
                        unit,
                        amount: unitAmount,
                        billingMonth,
                        dueDate,
                        status: invoice_entity_1.InvoiceStatus.UNPAID,
                        items: { base: '1/N (exception)' },
                    });
                    remainingAmount -= unitAmount;
                }
            }
            // 2. Process normal units (1/N)
            if (normalUnits.length > 0) {
                const perUnitAmount = remainingAmount / normalUnits.length;
                for (const unit of normalUnits) {
                    resultInvoices.push({
                        unit,
                        amount: perUnitAmount,
                        billingMonth,
                        dueDate,
                        status: invoice_entity_1.InvoiceStatus.UNPAID,
                        items: { base: '1/N' },
                    });
                }
            }
            // 3. Save invoices
            const savedInvoices = await this.invoiceRepository.save(this.invoiceRepository.create(resultInvoices));
            return savedInvoices;
        }
        async findUnpaid() {
            return this.invoiceRepository.find({
                where: { status: invoice_entity_1.InvoiceStatus.UNPAID },
                relations: ['unit'],
            });
        }
    };
    return BillingService = _classThis;
})();
exports.BillingService = BillingService;
