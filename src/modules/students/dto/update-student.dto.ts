import { ApiProperty } from "@nestjs/swagger";
import { Status } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateStudentDto {
  @ApiProperty({
    example: "Palonchiyev Pistonchi",
  })
  @IsString()
  @MinLength(3)
  fullName?: string;

  @ApiProperty({
    example: "+998997760306",
  })
  @IsString()
  @MinLength(9)
  phone?: string;

  @ApiProperty({
    example: "Ali12345",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({
    required: false,
    type: "string",
    format: "binary",
  })
  @IsOptional()
  file?: any;

  @ApiProperty({ required: false, enum: Status, example: Status.ACTIVE })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
