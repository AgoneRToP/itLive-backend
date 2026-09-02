import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateHomeworkDto {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsInt()
  lessonId: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsOptional()
  file?: any;
}