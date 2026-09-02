import { ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsOptional,
    IsString,
    IsEmail,
    IsPhoneNumber,
    IsInt,
    Min,
} from "class-validator";

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: "Istamov Xurshid" })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiPropertyOptional({ example: "+998917911122" })
    @IsOptional()
    @IsPhoneNumber("UZ")
    phone?: string;

    @ApiPropertyOptional({ example: "example@gmail.com" })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: "Full Stack Developer" })
    @IsOptional()
    @IsString()
    job?: string;

    @ApiPropertyOptional({ example: 5 })
    @IsOptional()
    @IsInt()
    @Min(0)
    experience?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    site?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    telegram?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    instagram?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    facebook?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    linkedin?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    github?: string;
}
