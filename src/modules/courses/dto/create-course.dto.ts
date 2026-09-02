import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CourseLevel, Status } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";

export class CreateCourseDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  banner: any;

  @IsOptional()
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  introVideo?: any;

  @ApiProperty({
    example: "Full-stack",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "Node.js & Vue.js",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: "BEGINNER",
  })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({
    example: "12345",
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @ApiProperty({
    example: "1",
  })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoryId: number;

  @ApiPropertyOptional({
    example: "1",
    description: "Mentor ID",
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  teacherId?: number;

  @ApiPropertyOptional({
    example: "ACTIVE",
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
