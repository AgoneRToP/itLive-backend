import { Module } from '@nestjs/common';
import { CourseCommentsService } from './course-comments.service';
import { CourseCommentsController } from './course-comments.controller';
import { PrismaModule } from '../../core/database/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';
import { QaGateway } from './qa.gateway';

@Module({
  imports: [PrismaModule, NotificationsModule, AuthModule],
  controllers: [CourseCommentsController],
  providers: [CourseCommentsService, QaGateway],
})
export class CourseCommentsModule {}
