import {
    Query,
    BadRequestException,
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
    ParseEnumPipe,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiExtraModels,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { Status, User, UserRoles } from "@prisma/client";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { courseFileFilter, courseFileStorage } from "./courses.multer";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { query } from "axios";
import { PageQueryDto } from "./dto/query.dto";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

const fileInterceptor = FileFieldsInterceptor(
    [
        { name: "banner", maxCount: 1 },
        { name: "introVideo", maxCount: 1 },
    ],
    {
        storage: courseFileStorage,
        fileFilter: courseFileFilter,
        limits: { fileSize: 500 * 1024 * 1024 },
    },
);

export type CourseFiles = {
    banner?: Express.Multer.File[];
    introVideo?: Express.Multer.File[];
};

@ApiTags("Courses")
@Controller("courses")
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    @Get()
    @RequirePermissions(ResourceCategory.COURSE, PermissionAction.READ)
    findAll(@Query() query: PageQueryDto) {
        return this.coursesService.findAll(
            query.page,
            query.limit,
            query.isActive,
        );
    }

    @Get("my-courses")
    @Roles(UserRoles.MENTOR)
    @RequirePermissions(ResourceCategory.COURSE, PermissionAction.READ)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "MENTOR - o'z kurslarini olish" })
    findMyCourses(@CurrentUser() user: { id: number }) {
        return this.coursesService.findMyCourses(user.id);
    }

    @Get(":id")
    @RequirePermissions(ResourceCategory.COURSE, PermissionAction.READ)
    findOne(@Param("id", ParseIntPipe) id: number) {
        return this.coursesService.findOne(id);
    }

    @Post()
    @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MENTOR)
    @RequirePermissions(ResourceCategory.COURSE, PermissionAction.CREATE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "SUPERADMIN - Yangi kurs yaratish" })
    @ApiConsumes("multipart/form-data")
    @ApiExtraModels(CreateCourseDto)
    @ApiBody({ type: CreateCourseDto })
    @UseInterceptors(fileInterceptor)
    create(
        @Body() dto: CreateCourseDto,
        @UploadedFiles() files: CourseFiles,
        @CurrentUser() user: { id: number; role: UserRoles },
    ) {
        if (!files?.banner?.[0]) {
            throw new BadRequestException("Banner majburiy");
        }
        return this.coursesService.create(dto, files, user);
    }

    @Patch(":id")
    @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MENTOR)
    @RequirePermissions(ResourceCategory.COURSE, PermissionAction.UPDATE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "SUPERADMIN - Kursni tahrirlash" })
    @ApiConsumes("multipart/form-data")
    @ApiExtraModels(UpdateCourseDto)
    @ApiBody({ type: UpdateCourseDto })
    @UseInterceptors(fileInterceptor)
    update(
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: UpdateCourseDto,
        @UploadedFiles() files: CourseFiles,
        @CurrentUser() user: { id: number; role: UserRoles },
    ) {
        return this.coursesService.update(id, dto, files, user);
    }

    @Patch(":id/archive")
    @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
    @RequirePermissions(ResourceCategory.COURSE, PermissionAction.VIEW_ARCHIVE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "Faqat SUPERADMIN - Archive Kursni" })
    async archiveMentor(@Param("id") id: number) {
        return await this.coursesService.archive(id);
    }

    @Patch(":id/restore")
    @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
    @RequirePermissions(ResourceCategory.COURSE, PermissionAction.UPDATE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "Faqat SUPERADMIN - Restore Kursni" })
    async restoreMentor(@Param("id") id: number) {
        return await this.coursesService.restore(id);
    }

    @Delete(":id")
    @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MENTOR)
    @RequirePermissions(ResourceCategory.COURSE, PermissionAction.DELETE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "SUPERADMIN - Kursni o'chirish" })
    remove(@Param("id", ParseIntPipe) id: number) {
        return this.coursesService.remove(id);
    }
}
