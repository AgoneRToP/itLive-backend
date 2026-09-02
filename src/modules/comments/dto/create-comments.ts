// src/modules/comments/dto/create-comments.ts

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCommentsDto {
    @ApiProperty({
        example: "Charlie Brown",
        description: "Foydalanuvchining F.I.SH",
    })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({ example: "+998901234567", description: "Telefon raqami" })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({
        example: "Manga backend kursi bo'yicha ma'lumot kerak edi",
        description: "Xabar matni",
    })
    @IsString()
    @IsNotEmpty()
    message: string;
}
