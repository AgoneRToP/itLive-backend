import {
  ApiProperty,
  ApiPropertyOptional,
} from "@nestjs/swagger";

import {
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateMentorDto {
  @ApiProperty({
    example: "Mr Kebyu",
  })
  @IsString()
  @MinLength(3)
  fullName: string;

  @ApiProperty({
    example: "+998990007007",
  })
  @IsString()
  @MinLength(9)
  phone: string;

  @ApiProperty({
    example: "Kebyu007",
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: "5 yil",
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional({
    example: "Frontend Developer",
  })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional({
    example: "https://example.com",
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    example: "Frontend va Backend bo'yicha mentor",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: "https://facebook.com/example",
  })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({
    example: "@telegram_username",
  })
  @IsOptional()
  @IsString()
  telegram?: string;

  @ApiPropertyOptional({
    example: "https://linkedin.com/in/example",
  })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional({
    example: "https://instagram.com/example",
  })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({
    example: "https://github.com/example",
  })
  @IsOptional()
  @IsString()
  github?: string;
}