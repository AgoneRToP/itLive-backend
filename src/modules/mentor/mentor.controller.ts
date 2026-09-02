import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
  Query,
  ParseEnumPipe,
} from "@nestjs/common";
import { MentorService } from "./mentor.service";
import { Roles } from "src/common/decorators/roles.decorator";
import { Status, UserRoles } from "@prisma/client";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { CreateMentorDto } from "./dto/mentor-create.dto";
import { UpdateMentorDto } from "./dto/mentor-update.dto";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@Controller("mentors")
export class MentorController {
  constructor(private mentorService: MentorService) {}

  @Get()
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.TEACHER, PermissionAction.READ)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "SUPERADMIN - Get All Mentor" })
  getAll(
    @Query("status", new ParseEnumPipe(Status, { optional: true }))
    status?: Status,
  ) {
    return this.mentorService.getAll(status);
  }

  @Get(":id")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.TEACHER, PermissionAction.READ)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "SUPERADMIN, Admin - Get One Mentor" })
  getOne(@Param("id") id: string) {
    return this.mentorService.getOne(Number(id));
  }

  @Post()
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.TEACHER, PermissionAction.CREATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "SUPERADMIN, Admin- Create Mentor" })
  create(@Body() dto: CreateMentorDto) {
    return this.mentorService.create(dto);
  }

  @Patch(":id")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.TEACHER, PermissionAction.UPDATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "SUPERADMIN, Admin - Update Mentor" })
  update(@Param("id") id: string, @Body() dto: UpdateMentorDto) {
    return this.mentorService.update(Number(id), dto);
  }

  @Patch(":id/archive")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.TEACHER, PermissionAction.VIEW_ARCHIVE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Faqat SUPERADMIN - Archive Mentor" })
  async archiveMentor(@Param("id") id: number) {
    return await this.mentorService.archiveMentor(id);
  }

  @Patch(":id/restore")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.TEACHER, PermissionAction.UPDATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Faqat SUPERADMIN - Restore Mentor" })
  async restoreMentor(@Param("id") id: number) {
    return await this.mentorService.restoreMentor(id);
  }

  @Delete(":id")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.TEACHER, PermissionAction.DELETE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "SUPERADMIN, Admin - Delete Mentor" })
  remove(@Param("id") id: string) {
    return this.mentorService.remove(Number(id));
  }
}
