import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseEnumPipe,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { Status, UserRoles } from "@prisma/client";
import { Roles } from "src/common/decorators/roles.decorator";
import { ApiBearerAuth } from "@nestjs/swagger";
import { RolesGuard } from "src/common/guards/roles.guard";
import { query } from "axios";
import { PageQueryDto } from "../courses/dto/query.dto";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { RequirePermissions } from "src/common/decorators/permissions.decorator";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

@UseGuards(JwtAuthGuard)
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  findAll(
    @Query() query: PageQueryDto,
  ) {
    return this.paymentsService.findAll(query.isActive);
  }

  @Get(":id")
  findOne(
    @Param("courseId") id: number,
    @CurrentUser() user: { id: number; role: UserRoles },
  ) {
    return this.paymentsService.findOne(id, user.id);
  }

  @Patch()
  update(@Body() payload: UpdatePaymentDto) {
    return this.paymentsService.update(
      Number(payload.courseId),
      Number(payload.userId),
    );
  }

  @Delete(":id")
  remove(
    @Param("courseId") id: number,
    @CurrentUser() user: { id: number; role: UserRoles },
  ) {
    return this.paymentsService.remove(id, user);
  }

  @Patch("admin/:id")
  @Roles(UserRoles.SUPERADMIN)
  @RequirePermissions(ResourceCategory.PAYMENT, PermissionAction.UPDATE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  update2(@Param("id") id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.updateById(+id, dto);
  }

  @Delete("admin/:id")
  @Roles(UserRoles.SUPERADMIN)
  @RequirePermissions(ResourceCategory.PAYMENT, PermissionAction.DELETE)
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  remove2(@Param("id") id: string) {
    return this.paymentsService.removeById(+id);
  }
}
