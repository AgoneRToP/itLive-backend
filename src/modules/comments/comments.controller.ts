import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRoles } from "@prisma/client";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { CreateCommentsDto } from "./dto/create-comments";
import { UpdateCommentsDto } from "./dto/update-comments";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@ApiTags("Comments")
@Controller("comments")
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Post()
    createComment(@Body() dto: CreateCommentsDto) {
        return this.commentsService.create(dto);
    }

    @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Get()
    @ApiOperation({
        summary: "Faqat SUPERADMIN va ADMIN - Barcha commentlarni ko'rish",
    })
    findAllComments() {
        return this.commentsService.findAll();
    }

    @Get(":id")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.COMMENT, PermissionAction.READ)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({
        summary: "Faqat SUPERADMIN va ADMIN -commentlarni id bo'yicha ko'rish",
    })
    findOneComment(@Param("id") id: string) {
        return this.commentsService.findOne(+id);
    }

    @ApiOperation({
        summary: "Faqat SUPERADMIN va ADMIN - Commentlarni update qilish",
    })
    @Patch(":id")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.COMMENT, PermissionAction.UPDATE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    update(@Param("id") id: string, @Body() dto: UpdateCommentsDto) {
        return this.commentsService.update(+id, dto);
    }

    @Delete(":id")
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @RequirePermissions(ResourceCategory.COMMENT, PermissionAction.DELETE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({
        summary: "Faqat SUPERADMIN va ADMIN - Commentlarni o'chirish",
    })
    deleteComment(@Param("id") id: string) {
        return this.commentsService.delete(+id);
    }
}