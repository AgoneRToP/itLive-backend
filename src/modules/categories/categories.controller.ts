import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Roles } from "src/common/decorators/roles.decorator";
import { Status, UserRoles } from "@prisma/client";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@ApiTags("Categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserRoles.SUPERADMIN)
  @RequirePermissions(ResourceCategory.CATEGORY, PermissionAction.CREATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "SUPERADMIN - Create Category" })
  async create(@Body() dto: CreateCategoryDto) {
    return await this.categoriesService.create(dto);
  }

  @Get()
  findAll(
      @Query("status", new ParseEnumPipe(Status, { optional: true }))
      status?: Status,
    ) {
    return this.categoriesService.findAll(status);
  }

  @Get(":id")
  @Roles(UserRoles.SUPERADMIN)
  @RequirePermissions(ResourceCategory.CATEGORY, PermissionAction.READ)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "SUPERADMIN - Get Category By ID" })
  findOne(@Param("id") id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Put(":id")
  @Roles(UserRoles.SUPERADMIN)
  @RequirePermissions(ResourceCategory.CATEGORY, PermissionAction.UPDATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "SUPERADMIN - Update Category" })
  update(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(+id, dto);
  }

  @Patch(":id/archive")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.CATEGORY, PermissionAction.VIEW_ARCHIVE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "SUPERADMIN - Archive Category" })
  async archiveMentor(@Param("id") id: number) {
      return await this.categoriesService.archive(id);
  }

  @Patch(":id/restore")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.CATEGORY, PermissionAction.UPDATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "SUPERADMIN - Restore Category" })
  async restoreMentor(@Param("id") id: number) {
      return await this.categoriesService.restore(id);
  }

  @Delete(":id")
  @Roles(UserRoles.SUPERADMIN)
  @RequirePermissions(ResourceCategory.CATEGORY, PermissionAction.DELETE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: "SUPERADMIN - Delete Category" })
  remove(@Param("id") id: string) {
    return this.categoriesService.remove(+id);
  }
}
