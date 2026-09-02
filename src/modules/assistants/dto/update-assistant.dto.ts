import { ApiProperty } from "@nestjs/swagger";
import { Status } from "@prisma/client";
import { IsEnum, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator";

export class UpdateAssistantDto {
  @ApiProperty({
    example: "Michael De Santa",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  fullName?: string;

  @ApiProperty({
    example: "+998901234567",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('UZ')
  phone?: string;

  @ApiProperty({
    example: "Mike_12345",
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
