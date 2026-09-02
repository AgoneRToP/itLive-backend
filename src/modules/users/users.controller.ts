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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Status, UserRoles } from "@prisma/client";
import { diskStorage } from "multer";
import { extname } from "path";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@Controller("user")
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get("admin")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Faqat SUPERADMIN" })
  async getAllAdmins(
    @Query("status", new ParseEnumPipe(Status, { optional: true }))
    status?: Status,
  ) {
    return await this.service.getAllAdmins(status);
  }

  @Get("dashboard")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions(ResourceCategory.DASHBOARD, PermissionAction.READ)
  @ApiOperation({ summary: "SUPERADMIN va ruxsati bor ADMINlar uchun" })
  async getCountByRoleAndCoursess() {
    return await this.service.getCountByRolesAndCourses();
  }

  @Post("admin")
  @Roles(UserRoles.SUPERADMIN)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Faqat SUPERADMIN" })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/avatars",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createAdmin(
    @Body() payload: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.service.createAdmin(payload, file);
  }

  @Patch("admin/:id")
  @Roles(UserRoles.SUPERADMIN)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Faqat SUPERADMIN" })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/avatars",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateAdmin(
    @Param("id") id: number,
    @Body() payload: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.service.updateAdmin(id, payload, file);
  }

  @Patch("admin/:id/archive")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Faqat SUPERADMIN" })
  async archiveAdmin(@Param("id") id: number) {
    return await this.service.archiveAdmin(id);
  }

  @Patch("admin/:id/restore")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Faqat SUPERADMIN" })
  async restoreAdmin(@Param("id") id: number) {
    return await this.service.restoreAdmin(id);
  }

  @Delete("admin/:id")
  @Roles(UserRoles.SUPERADMIN)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Faqat SUPERADMIN" })
  async deleteAdmin(@Param("id") id: number) {
    return await this.service.deleteAdmin(id);
  }
}
