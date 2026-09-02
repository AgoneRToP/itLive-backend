import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SectionsService } from "./sections.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import { UpdateSectionDto } from "./dto/update-section.dto";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { UserRoles } from "@prisma/client";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

@ApiTags("Sections")
@Controller("sections")
export class SectionsController {
    constructor(private readonly sectionsService: SectionsService) {}

    @Get()
    @Roles(UserRoles.SUPERADMIN, UserRoles.MENTOR)
    @RequirePermissions(ResourceCategory.SECTION, PermissionAction.READ)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "SUPERADMIN - Barcha bo'limlarni olish" })
    findAll(@CurrentUser() user: { id: number; role: UserRoles }) {
        return this.sectionsService.findAll(user);
    }

    @Get(":id")
    @Roles(UserRoles.SUPERADMIN, UserRoles.MENTOR)
    @RequirePermissions(ResourceCategory.SECTION, PermissionAction.READ)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "SUPERADMIN - Bo'limni id bo'yicha olish" })
    findOne(@Param("id", ParseIntPipe) id: number) {
        return this.sectionsService.findOne(id);
    }

    @Post()
    @Roles(UserRoles.SUPERADMIN, UserRoles.MENTOR)
    @RequirePermissions(ResourceCategory.SECTION, PermissionAction.CREATE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "SUPERADMIN - Yangi bo'lim yaratish" })
    create(@Body() dto: CreateSectionDto) {
        return this.sectionsService.create(dto);
    }

    @Patch(":id")
    @Roles(UserRoles.SUPERADMIN, UserRoles.MENTOR)
    @RequirePermissions(ResourceCategory.SECTION, PermissionAction.UPDATE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "SUPERADMIN - Bo'limni tahrirlash" })
    update(
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: UpdateSectionDto,
    ) {
        return this.sectionsService.update(id, dto);
    }

    @Delete(":id")
    @Roles(UserRoles.SUPERADMIN)
    @RequirePermissions(ResourceCategory.SECTION, PermissionAction.DELETE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "SUPERADMIN - Bo'limni o'chirish" })
    remove(@Param("id", ParseIntPipe) id: number) {
        return this.sectionsService.remove(id);
    }
}
