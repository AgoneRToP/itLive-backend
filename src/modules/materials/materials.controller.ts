import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Delete,
  UseGuards,
  Param,
  ParseIntPipe,
  Get,
  Patch,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { MaterialsService } from "./materials.service";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiBody } from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRoles } from "@prisma/client";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { UpdateMaterialDto } from "./dto/update-material.dto";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@Controller("materials")
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MENTOR, UserRoles.ASSISTANT, UserRoles.STUDENT)
  @RequirePermissions(ResourceCategory.MATERIAL, PermissionAction.READ)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Barcha materiallarni olish" })
  findAll() {
    return this.materialsService.findAll();
  }

  @Get(":lessonId")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MENTOR, UserRoles.ASSISTANT, UserRoles.STUDENT)
  @RequirePermissions(ResourceCategory.MATERIAL, PermissionAction.READ)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Materialni lesson_id bo'yicha olish" })
  findOne(@Param("lessonId", ParseIntPipe) id: number) {
    return this.materialsService.findOne(id);
  }

  @Post()
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MENTOR, UserRoles.ASSISTANT)
  @RequirePermissions(ResourceCategory.MATERIAL, PermissionAction.CREATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Material yaratish" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        lessonId: { type: "integer", example: 1 },
        title: { type: "string", example: "Material title" },
        description: { type: "string", example: "Material description" },
        file: {
          type: "array",
          items: { type: "string", format: "binary" },
        },
      },
      required: ["lessonId", "title", "description"],
    },
  })
  @UseInterceptors(
    FilesInterceptor("file", 10, {
      storage: diskStorage({
        destination: "./uploads/materials",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  create(
    @Body() dto: CreateMaterialDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.materialsService.create(dto, files);
  }

  @Patch(":id")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MENTOR, UserRoles.ASSISTANT)
  @RequirePermissions(ResourceCategory.MATERIAL, PermissionAction.UPDATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Materialni tahrirlash" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        lessonId: { type: "integer", example: 1 },
        title: { type: "string", example: "Updated title" },
        description: { type: "string", example: "Updated material" },
        file: {
          type: "array",
          items: { type: "string", format: "binary" },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor("file", 10, {
      storage: diskStorage({
        destination: "./uploads/materials",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateMaterialDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.materialsService.update(id, dto, files);
  }

  @Delete(":id")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MENTOR, UserRoles.ASSISTANT)
  @RequirePermissions(ResourceCategory.MATERIAL, PermissionAction.DELETE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Material o'chirish" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.materialsService.remove(id);
  }
}
