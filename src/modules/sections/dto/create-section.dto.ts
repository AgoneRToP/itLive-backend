import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateSectionDto {
  @ApiProperty({
    example: 1,
    description: "Course ID",
  })
  @IsInt()
  courseId: number;

  @ApiProperty({
    example: "Backend",
    description: "Section name",
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
