import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Status } from "@prisma/client";
import {
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  IsArray,
  ValidateNested
} from "class-validator";
import { Type } from "class-transformer";
import { ResourceCategory, PermissionAction } from "src/common/types/permissions.type";

class PermissionDto {
    @ApiProperty({ enum: ResourceCategory })
    @IsEnum(ResourceCategory)
    category: ResourceCategory;

    @ApiProperty({ isArray: true, enum: PermissionAction })
    @IsArray()
    @IsEnum(PermissionAction, { each: true })
    access: PermissionAction[];
}

export class UpdateUserDto {
  @ApiProperty({
    example: "Ali Valiyev",
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
  @IsPhoneNumber("UZ")
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

  @ApiPropertyOptional({ type: [PermissionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions?: PermissionDto[];
}
