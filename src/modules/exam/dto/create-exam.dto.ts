import { ApiProperty } from "@nestjs/swagger";
import { TestAnswer } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateExamDto {
  @ApiProperty({
    example: 1,
    description: "Lesson ID",
  })
  @IsNumber()
  @IsNotEmpty()
  lessonId: number;

  @ApiProperty({
    example: "What is a REST API?",
    description: "Question text",
  })
  @IsString()
  @IsNotEmpty()
  questoin: string;

  @ApiProperty({
    example: "A Language",
    description: "Variant A",
  })
  @IsString()
  @IsNotEmpty()
  variantA: string;

  @ApiProperty({
    example: "B Language",
    description: "Variant B",
  })
  @IsString()
  @IsNotEmpty()
  variantB: string;

  @ApiProperty({
    example: "C Language",
    description: "Variant C",
  })
  @IsString()
  @IsNotEmpty()
  variantC: string;

  @ApiProperty({
    example: "D Language",
    description: "Variant D",
  })
  @IsString()
  @IsNotEmpty()
  variantD: string;

  @ApiProperty({
    enum: TestAnswer,
    example: TestAnswer.variantA,
    description: "Correct answer",
  })
  @IsEnum(TestAnswer)
  @IsNotEmpty()
  answer: TestAnswer;
}
