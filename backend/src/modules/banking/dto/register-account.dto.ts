import { ApiProperty } from '@nestjs/swagger';

export class RegisterAccountDto {
  @ApiProperty({ example: 1, description: 'ID of the building' })
  buildingId: number;

  @ApiProperty({ example: '110-123-456789', description: 'Bank account number' })
  accountNumber: string;

  @ApiProperty({ example: 'Shinhan Bank', description: 'Name of the bank' })
  bankName: string;
}
