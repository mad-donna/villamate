import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Invoice } from '../billing/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice])],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
