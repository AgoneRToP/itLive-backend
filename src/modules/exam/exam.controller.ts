import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ExamService } from "./exam.service";
import { CreateExamDto } from "./dto/create-exam.dto";
import { UpdateExamDto } from "./dto/update-exam.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRoles } from "@prisma/client";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@ApiTags("Exam")
@Controller("exam")
export class ExamController {
  constructor(private examService: ExamService) {}

  @Get()
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MENTOR, UserRoles.ASSISTANT, UserRoles.STUDENT)
  @RequirePermissions(ResourceCategory.EXAM, PermissionAction.READ)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Get all exams (optionally by lessonId)" })
  @ApiQuery({ name: "lessonId", required: false, type: Number })
  getAll(
    @Query("lessonId", new ParseIntPipe({ optional: true }))
    lessonId?: number,
  ) {
    return this.examService.getAll(lessonId);
  }

  @Get(":id")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MENTOR, UserRoles.ASSISTANT, UserRoles.STUDENT)
  @RequirePermissions(ResourceCategory.EXAM, PermissionAction.READ)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Get one exam by id" })
  getOne(@Param("id", ParseIntPipe) id: number) {
    return this.examService.getOne(id);
  }

  @Post()
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MENTOR, UserRoles.ASSISTANT)
  @RequirePermissions(ResourceCategory.EXAM, PermissionAction.CREATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Create exam" })
  create(@Body() dto: CreateExamDto, @Req() req) {
    return this.examService.create(dto, req.user.id);
  }

  @Patch(":id")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MENTOR, UserRoles.ASSISTANT)
  @RequirePermissions(ResourceCategory.EXAM, PermissionAction.UPDATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Update exam" })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateExamDto) {
    return this.examService.update(id, dto);
  }

  @Delete(":id")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MENTOR, UserRoles.ASSISTANT)
  @RequirePermissions(ResourceCategory.EXAM, PermissionAction.DELETE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Delete exam" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.examService.delete(id);
  }
}
