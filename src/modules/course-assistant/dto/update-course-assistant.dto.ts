import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateCourseAssistantDto } from "./create-course-assistant.dto";
import { IsEnum, IsOptional } from "class-validator";
import { Status } from "@prisma/client";

export class UpdateCourseAssistantDto extends PartialType(
  CreateCourseAssistantDto,
) {
  @ApiProperty({ required: false, enum: Status, example: Status.ACTIVE })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
