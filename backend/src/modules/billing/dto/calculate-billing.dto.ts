import { ApiProperty } from '@nestjs/swagger';

export class CalculateBillingDto {
  @ApiProperty({ example: 1, description: 'ID of the building' })
  buildingId: number;

  @ApiProperty({ example: 500000, description: 'Total amount for the building' })
  totalAmount: number;

  @ApiProperty({ example: '2026-03', description: 'Billing month in YYYY-MM format' })
  billingMonth: string; // 'YYYY-MM'

  @ApiProperty({ example: '2026-03-31', description: 'Due date for payment' })
  dueDate: Date;

  @ApiProperty({
    required: false,
    example: [{ unitId: 101, amount: 50000 }],
    description: 'Manual overrides for specific units',
  })
  exceptions?: {
    unitId: number;
    amount?: number; // Fixed amount
    ratio?: number; // Ratio (0.0 to 1.0)
  }[];
}
