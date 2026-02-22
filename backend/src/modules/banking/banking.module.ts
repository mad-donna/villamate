import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankingController } from './banking.controller';
import { BankingService } from './banking.service';
import { BankAccount } from './bank-account.entity';
import { Invoice } from '../billing/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount, Invoice])],
  controllers: [BankingController],
  providers: [BankingService],
  exports: [BankingService],
})
export class BankingModule {}
