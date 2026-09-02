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
import { AssistantsService } from "./assistants.service";
import { CreateAssistantDto } from "./dto/create-assistant.dto";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Status, UserRoles } from "@prisma/client";
import { diskStorage } from "multer";
import { extname } from "path";
import { UpdateAssistantDto } from "./dto/update-assistant.dto";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@ApiTags("Assistants")
@Controller("user")
export class AssistantsController {
  constructor(private readonly service: AssistantsService) {}

  @Get("assistant")
  @Roles(UserRoles.SUPERADMIN)
  @RequirePermissions(ResourceCategory.ASSISTANT, PermissionAction.READ)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Faqat SUPERADMIN" })
  async getAllAssistants(
    @Query("status", new ParseEnumPipe(Status, { optional: true }))
    status?: Status,
  ) {
    return await this.service.getAllAssistants(status);
  }

  @Post("assistant")
  @Roles(UserRoles.SUPERADMIN)
  @RequirePermissions(ResourceCategory.ASSISTANT, PermissionAction.CREATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
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
  async createAssistant(
    @Body() payload: CreateAssistantDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.service.createAssistant(payload, file);
  }

  @Patch("assistant/:id")
  @Roles(UserRoles.SUPERADMIN)
  @RequirePermissions(ResourceCategory.ASSISTANT, PermissionAction.UPDATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
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
  async updateAssistant(
    @Param("id") id: number,
    @Body() payload: UpdateAssistantDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.service.updateAssistant(id, payload, file);
  }

  @Patch("assistant/:id/archive")
  @Roles(UserRoles.SUPERADMIN)
  @RequirePermissions(ResourceCategory.ASSISTANT, PermissionAction.VIEW_ARCHIVE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Faqat SUPERADMIN" })
  async archiveAssistant(@Param("id") id: number) {
    return await this.service.archiveAssistant(id);
  }

  @Patch("assistant/:id/restore")
  @Roles(UserRoles.SUPERADMIN)
  @RequirePermissions(ResourceCategory.ASSISTANT, PermissionAction.UPDATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Faqat SUPERADMIN" })
  async restoreAssistant(@Param("id") id: number) {
    return await this.service.restoreAssistant(id);
  }

  @Delete("assistant/:id")
  @Roles(UserRoles.SUPERADMIN)
  @RequirePermissions(ResourceCategory.ASSISTANT, PermissionAction.DELETE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Faqat SUPERADMIN" })
  async deleteAssistant(@Param("id") id: number) {
    return await this.service.deleteAssistant(id);
  }
}
