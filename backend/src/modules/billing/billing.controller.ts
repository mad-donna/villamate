import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CalculateBillingDto } from './dto/calculate-billing.dto';

@ApiTags('billing')
@Controller('api/v1/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate monthly billing for a building' })
  async calculate(@Body() calculateBillingDto: CalculateBillingDto) {
    return this.billingService.calculate(calculateBillingDto);
  }

  @Get('unpaid')
  @ApiOperation({ summary: 'Find all unpaid invoices' })
  async findUnpaid() {
    return this.billingService.findUnpaid();
  }
}
