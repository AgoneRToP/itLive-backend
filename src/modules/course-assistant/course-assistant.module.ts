import { Module } from '@nestjs/common';
import { CourseAssistantController } from './course-assistant.controller';
import { CourseAssistantService } from './course-assistant.service';

@Module({
  controllers: [CourseAssistantController],
  providers: [CourseAssistantService],
})
export class CourseAssistantModule {}