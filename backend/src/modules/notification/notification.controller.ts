import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@Controller('api/v1/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('remind')
  @ApiOperation({ summary: 'Send reminders for unpaid invoices' })
  async remind() {
    return this.notificationService.remindUnpaid();
  }
}
