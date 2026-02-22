"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const building_entity_1 = require("./modules/building/building.entity");
const unit_entity_1 = require("./modules/unit/unit.entity");
const user_entity_1 = require("./modules/user/user.entity");
const invoice_entity_1 = require("./modules/billing/invoice.entity");
const bank_account_entity_1 = require("./modules/banking/bank-account.entity");
const billing_module_1 = require("./modules/billing/billing.module");
const notification_module_1 = require("./modules/notification/notification.module");
const banking_module_1 = require("./modules/banking/banking.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'sqlite',
                    database: 'db.sqlite',
                    entities: [building_entity_1.Building, unit_entity_1.Unit, user_entity_1.User, invoice_entity_1.Invoice, bank_account_entity_1.BankAccount],
                    synchronize: true,
                }),
            }),
            billing_module_1.BillingModule,
            notification_module_1.NotificationModule,
            banking_module_1.BankingModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map