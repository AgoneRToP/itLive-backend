import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { PresenceGateway } from './presence.gateway';
import { PrismaModule } from '../../core/database/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, PresenceGateway],
  exports: [NotificationsService, PresenceGateway],
})
export class NotificationsModule {}
