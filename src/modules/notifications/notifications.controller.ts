import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('unread')
  getUnread(@Req() req: any) {
    return this.notificationsService.findAllUnread(req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id, req.user.role);
  }
}
