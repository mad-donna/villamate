import { ApiProperty } from '@nestjs/swagger';

export class SettleInvoiceDto {
  @ApiProperty({ example: 1, description: 'ID of the invoice to settle' })
  invoiceId: number;
}
