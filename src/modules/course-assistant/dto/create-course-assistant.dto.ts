import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateCourseAssistantDto {
  @ApiProperty({
    example: 1,
    description: 'Course ID',
  })
  @IsInt()
  courseId: number;

  @ApiProperty({
    example: 2,
    description: 'User ID',
  })
  @IsInt()
  userId: number;
}