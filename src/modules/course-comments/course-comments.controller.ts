import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { CourseCommentsService } from './course-comments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@Controller('course-comments')
export class CourseCommentsController {
  constructor(private readonly courseCommentsService: CourseCommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: { courseId: number; text: string; parentId?: number }, @Req() req: any) {
    return this.courseCommentsService.create(body.courseId, req.user.id, body.text, body.parentId);
  }

  @Get(':courseId')
  findByCourseId(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.courseCommentsService.findByCourseId(courseId);
  }
}
