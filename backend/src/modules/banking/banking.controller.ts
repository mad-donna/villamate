import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BankingService } from './banking.service';
import { RegisterAccountDto } from './dto/register-account.dto';
import { SettleInvoiceDto } from './dto/settle-invoice.dto';

@ApiTags('banking')
@Controller('api/v1/banking')
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Post('account')
  @ApiOperation({ summary: 'Register a mock building account' })
  async registerAccount(@Body() dto: RegisterAccountDto) {
    return this.bankingService.registerAccount(
      dto.buildingId,
      dto.accountNumber,
      dto.bankName,
    );
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get mock transactions for an account' })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTransactions(@Query('accountId', ParseIntPipe) accountId: number) {
    return this.bankingService.getTransactions();
  }

  @Post('settlement')
  @ApiOperation({ summary: 'Mock Webhook for invoice settlement' })
  async settleInvoice(@Body() dto: SettleInvoiceDto) {
    return this.bankingService.settleInvoice(dto.invoiceId);
  }
}
