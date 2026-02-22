import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Building } from './modules/building/building.entity';
import { Unit } from './modules/unit/unit.entity';
import { User } from './modules/user/user.entity';
import { Invoice } from './modules/billing/invoice.entity';
import { BankAccount } from './modules/banking/bank-account.entity';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationModule } from './modules/notification/notification.module';
import { BankingModule } from './modules/banking/banking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: 'db.sqlite',
        entities: [Building, Unit, User, Invoice, BankAccount],
        synchronize: true, // Only for development
      }),
    }),
    BillingModule,
    NotificationModule,
    BankingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
