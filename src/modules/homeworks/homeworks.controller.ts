import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

import { HomeworksService } from "./homeworks.service";
import { CreateHomeworkDto } from "./dto/create-homework.dto";
import { UpdateHomeworkDto } from "./dto/update-homework.dto";

import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRoles } from "@prisma/client";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@ApiTags("Homeworks")
@Controller("homeworks")
export class HomeworksController {
  constructor(
    private readonly homeworksService: HomeworksService,
  ) { }

  @Get()
  @Roles(
    UserRoles.SUPERADMIN,
    UserRoles.ADMIN,
    UserRoles.MENTOR,
    UserRoles.ASSISTANT,
    UserRoles.STUDENT,
  )
  @RequirePermissions(ResourceCategory.HOMEWORK, PermissionAction.READ)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Barcha homeworkslarni olish" })
  findAll() {
    return this.homeworksService.findAll();
  }

  @Get("mine")
  @Roles(
    UserRoles.SUPERADMIN,
    UserRoles.ADMIN,
    UserRoles.MENTOR,
  )
  @RequirePermissions(ResourceCategory.HOMEWORK, PermissionAction.READ)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Mentor ga aloqador barcha Homework'larni olish" })
  findAllMine(
    @CurrentUser() user: { id: number; role: UserRoles },
  ) {
    return this.homeworksService.findAllMine(user);
  }

  @Get(":lessonId")
  @Roles(
    UserRoles.SUPERADMIN,
    UserRoles.ADMIN,
    UserRoles.MENTOR,
    UserRoles.ASSISTANT,
    UserRoles.STUDENT,
  )
  @RequirePermissions(ResourceCategory.HOMEWORK, PermissionAction.READ)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Homeworkni lesson_id bo'yicha olish" })
  findOne(
    @Param("lessonId", ParseIntPipe) lessonId: number,
  ) {
    return this.homeworksService.findOne(lessonId);
  }

  @Post()
  @Roles(
    UserRoles.SUPERADMIN,
    UserRoles.ADMIN,
    UserRoles.MENTOR,
    UserRoles.ASSISTANT,
  )
  @RequirePermissions(ResourceCategory.HOMEWORK, PermissionAction.CREATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Homework yaratish" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        lessonId: {
          type: "integer",
          example: 1,
        },
        title: {
          type: "string",
          example: "Homework title",
        },
        description: {
          type: "string",
          example: "Homework description",
        },
        file: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
      required: ["lessonId", "title", "description"],
    },
  })
  @UseInterceptors(
    FilesInterceptor("file", 10, {
      storage: diskStorage({
        destination: "./uploads/homeworks",
        filename(req, file, cb) {
          const unique =
            Date.now() +
            "-" +
            Math.round(Math.random() * 100000);

          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  create(
    @Body() dto: CreateHomeworkDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.homeworksService.create(dto, files);
  }

  @Patch(":id")
  @Roles(
    UserRoles.SUPERADMIN,
    UserRoles.ADMIN,
    UserRoles.MENTOR,
    UserRoles.ASSISTANT,
  )
  @RequirePermissions(ResourceCategory.HOMEWORK, PermissionAction.UPDATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        lessonId: {
          type: "integer",
          example: 1,
        },
        title: {
          type: "string",
          example: "Updated title",
        },
        description: {
          type: "string",
          example: "Updated homework",
        },
        file: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor("file", 10, {
      storage: diskStorage({
        destination: "./uploads/homeworks",
        filename(req, file, cb) {
          const unique =
            Date.now() +
            "-" +
            Math.round(Math.random() * 100000);

          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateHomeworkDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.homeworksService.update(id, dto, files);
  }

  @Delete(":id")
  @Roles(
    UserRoles.SUPERADMIN,
    UserRoles.ADMIN,
    UserRoles.MENTOR,
    UserRoles.ASSISTANT,
  )
  @RequirePermissions(ResourceCategory.HOMEWORK, PermissionAction.DELETE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "Homeworkni o'chirish..." })
  remove(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.homeworksService.remove(id);
  }
}