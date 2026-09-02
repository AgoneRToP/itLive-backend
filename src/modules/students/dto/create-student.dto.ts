import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateStudentDto {
  @ApiProperty({
    example: "Palonchiyev Pistonchi",
  })
  @IsString()
  @MinLength(3)
  fullName: string;

  @ApiProperty({
    example: "+998997760306",
  })
  @IsString()
  @MinLength(9)
  phone: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    type: "string",
    format: "binary",
  })
  @IsOptional()
  file?: any;
}
