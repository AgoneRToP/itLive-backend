import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseAssistantService } from './course-assistant.service';
import { CreateCourseAssistantDto } from './dto/create-course-assistant.dto';
import { UpdateCourseAssistantDto } from './dto/update-course-assistant.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Status, UserRoles } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@ApiTags('Course Assistant')
@Controller('course-assistant')
export class CourseAssistantController {
  constructor(
    private readonly courseAssistantService: CourseAssistantService,
  ) { }

  @Post()
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.COURSE_ASSISTANT, PermissionAction.CREATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: 'SUPERADMIN - Create Course Assistant' })
  create(@Body() dto: CreateCourseAssistantDto) {
    return this.courseAssistantService.create(dto);
  }

  @Get()
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.COURSE_ASSISTANT, PermissionAction.READ)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: 'SUPERADMIN - Get All Course Assistants' })
  findAll(
    @Query("status", new ParseEnumPipe(Status, { optional: true }))
    status?: Status,
  ) {
    return this.courseAssistantService.findAll(status);
  }

  @Get(':id')
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.COURSE_ASSISTANT, PermissionAction.READ)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: 'SUPERADMIN - Get Course Assistant By ID' })
  findOne(@Param('id') id: string) {
    return this.courseAssistantService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.COURSE_ASSISTANT, PermissionAction.UPDATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: 'SUPERADMIN - Update Course Assistant' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseAssistantDto,
  ) {
    return this.courseAssistantService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.COURSE_ASSISTANT, PermissionAction.DELETE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: 'SUPERADMIN - Delete Course Assistant' })
  remove(@Param('id') id: string) {
    return this.courseAssistantService.remove(+id);
  }
}