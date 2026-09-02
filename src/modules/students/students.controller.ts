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
import { StudentService } from "./students.service";
import { Roles } from "src/common/decorators/roles.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { Status, UserRoles } from "@prisma/client";
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@ApiTags("Students")
@Controller("students")
export class StudentController {
    constructor(private readonly service: StudentService) {}

    @Get()
    @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
    @RequirePermissions(ResourceCategory.STUDENT, PermissionAction.READ)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "Faqat ADMIN - Barcha studentlarni olish" })
    async getAllStudents(
        @Query("status", new ParseEnumPipe(Status, { optional: true }))
        status?: Status,
    ) {
        return await this.service.getAllStudents(status);
    }

    @Get("my-courses")
    @Roles(UserRoles.STUDENT, UserRoles.SUPERADMIN)
    @RequirePermissions(ResourceCategory.STUDENT, PermissionAction.READ)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "Faqat STUDENT - o'zi to'lagan kurslarni olish" })
    async getMyCourses(@CurrentUser() user: { id: number }) {
        return await this.service.getMyCourses(user.id);
    }

    @Get("my-students")
    @Roles(UserRoles.MENTOR)
    @RequirePermissions(ResourceCategory.STUDENT, PermissionAction.READ)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({
        summary: "Faqat MENTOR - o'z kurslaridagi studentlarni olish",
    })
    async getMyStudents(
        @CurrentUser() user: { id: number },
        @Query("courseId") courseId?: string,
    ) {
        return await this.service.getMyStudents(
            user.id,
            courseId ? Number(courseId) : undefined,
        );
    }

    @Post()
    @Roles(UserRoles.SUPERADMIN)
    @RequirePermissions(ResourceCategory.STUDENT, PermissionAction.CREATE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiConsumes("multipart/form-data")
    @ApiOperation({ summary: "Faqat SUPERADMIN  - Studentni yaratolidi" })
    @UseInterceptors(
        FileInterceptor("file", {
            storage: diskStorage({
                destination: "./uploads/avatars",
                filename: (req, file, callback) => {
                    const uniqueSuffix =
                        Date.now() + "-" + Math.round(Math.random() * 1e9);
                    callback(
                        null,
                        `${uniqueSuffix}${extname(file.originalname)}`,
                    );
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    async createAdmin(
        @Body() payload: CreateUserDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return await this.service.createStudent(payload, file);
    }

    @Patch(":id")
    @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.STUDENT)
    @RequirePermissions(ResourceCategory.STUDENT, PermissionAction.UPDATE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiConsumes("multipart/form-data")
    @ApiOperation({ summary: "Faqat ADMIN - Studentni tahrirlash" })
    @UseInterceptors(
        FileInterceptor("file", {
            storage: diskStorage({
                destination: "./uploads/avatars",
                filename: (req, file, callback) => {
                    const uniqueSuffix =
                        Date.now() + "-" + Math.round(Math.random() * 1e9);
                    callback(
                        null,
                        `${uniqueSuffix}${extname(file.originalname)}`,
                    );
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    async updateStudent(
        @Param("id") id: number,
        @Body() payload: UpdateStudentDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return await this.service.updateStudent(id, payload, file);
    }
    @Get("my-courses/:courseId")
    @Roles(UserRoles.STUDENT, UserRoles.SUPERADMIN, UserRoles.ADMIN)
    @RequirePermissions(ResourceCategory.STUDENT, PermissionAction.READ)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({
        summary:
            "Faqat STUDENT - bitta kursning to'liq tafsilotlarini olish (darslar bilan)",
    })
    async getMyCourseDetails(
        @Param("courseId") courseId: string,
        @CurrentUser() user: { id: number },
    ) {
        return await this.service.getStudentCourseDetails(+courseId, user.id);
    }

    @Patch(":id/archive")
    @Roles(UserRoles.SUPERADMIN)
    @RequirePermissions(ResourceCategory.STUDENT, PermissionAction.VIEW_ARCHIVE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "Faqat SUPERADMIN - Studentni arxivlash" })
    async archiveStudent(@Param("id") id: number) {
        return await this.service.archiveStudent(id);
    }

    @Patch(":id/restore")
    @Roles(UserRoles.SUPERADMIN)
    @RequirePermissions(ResourceCategory.STUDENT, PermissionAction.UPDATE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({
        summary: "Faqat SUPERADMIN - Studentni arxivdan chiqarish (tiklash)",
    })
    async restoreStudent(@Param("id") id: number) {
        return await this.service.restoreStudent(id);
    }

    @Delete(":id")
    @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
    @RequirePermissions(ResourceCategory.STUDENT, PermissionAction.DELETE)
    @ApiBearerAuth("accessToken")
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @ApiOperation({ summary: "Faqat ADMIN - Studentni o'chiradi" })
    async deleteStudent(@Param("id") id: number) {
        return await this.service.deleteStudent(id);
    }
}
