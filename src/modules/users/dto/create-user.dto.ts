import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString, MinLength, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceCategory, PermissionAction } from 'src/common/types/permissions.type';
import { UserRoles } from '@prisma/client';

class PermissionDto {
    @ApiProperty({ enum: ResourceCategory })
    @IsEnum(ResourceCategory)
    category: ResourceCategory;

    @ApiProperty({ isArray: true, enum: PermissionAction })
    @IsArray()
    @IsEnum(PermissionAction, { each: true })
    access: PermissionAction[];
}

export class CreateUserDto {
    @ApiProperty({
        example: 'Ali Valiyev',
    })
    @IsString()
    @MinLength(5)
    fullName: string;

    @ApiProperty({
        example: '+998901234567',
    })
    @IsString()
    @IsPhoneNumber('UZ')
    phone: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ enum: UserRoles, required: false })
    @IsOptional()
    @IsEnum(UserRoles)
    role?: UserRoles;

    @ApiPropertyOptional({ type: [PermissionDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionDto)
    permissions?: PermissionDto[];

    @ApiProperty({
        type: 'string',
        format: 'binary'
    })
    @IsOptional()
    file?: any;
}