import { IsInt, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class CreateLessonDto {

  @ApiProperty({ example: 1, description: 'Section ID' })
  @Type(() => Number)
  @IsInt()
  sectionId: number;

  @ApiProperty({ example: 'Dars 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Dars haqida qisqacha' })
  @IsString()
  @IsNotEmpty()
  description: string;
  
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  @IsString()
  file: string;
}