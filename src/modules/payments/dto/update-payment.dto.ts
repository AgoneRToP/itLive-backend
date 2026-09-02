import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreatePaymentDto } from "./create-payment.dto";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { Status } from "@prisma/client";

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiProperty({ required: false, enum: Status, example: Status.ACTIVE })
  @IsOptional()
  @IsEnum(Status)
  isActive?: Status;
}
