import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ExamResultsDto } from "./dto/exam-results.dto";
import { ExamResultsService } from "./exam-results.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRoles } from "@prisma/client";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@ApiTags("Exam-results")
@Controller("exam-results")
export class ExamResultsController {
    constructor(private readonly servive: ExamResultsService) {}

    @Get()
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.MENTOR)
  @RequirePermissions(ResourceCategory.EXAM_RESULT, PermissionAction.READ)
    @ApiOperation({ summary: "Get Exam results" })
    async findAll(@Query() query: ExamResultsDto) {
        return this.servive.findAll(query);
    }
}

