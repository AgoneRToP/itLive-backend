import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class PageQueryDto {
    @ApiProperty({
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @ApiProperty({
        required: false,
        enum: Status
    })
    @IsOptional()
    @IsEnum(Status)
    isActive?: Status;
}