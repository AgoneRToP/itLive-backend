import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class ExamResultsDto {
    @ApiPropertyOptional({
        description: "O'quvchi ismi yoki familiyasi bo'yicha qidiruv",
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: "Boshlanish sanasi" })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiPropertyOptional({ description: "Tugash sanasi " })
    @ApiPropertyOptional({
        description: "Tugash sanasi",
    })
    @IsOptional()
    @IsString()
    endDate?: string;

    @ApiPropertyOptional({ default: 1 })
    @ApiPropertyOptional({
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 10 })
    @ApiPropertyOptional({
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;
}
