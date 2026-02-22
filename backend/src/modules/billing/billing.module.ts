import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { Unit } from '../unit/unit.entity';
import { Invoice } from './invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unit, Invoice])],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
