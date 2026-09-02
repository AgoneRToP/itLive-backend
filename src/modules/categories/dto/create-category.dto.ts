import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Backend',
    description: 'Category Name',
  })
  @IsString()
  @IsNotEmpty()
  name: string; 

  @ApiPropertyOptional({
    enum: Status,
    example: Status.ACTIVE,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}