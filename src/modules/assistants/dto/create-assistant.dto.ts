import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreateAssistantDto {
    @ApiProperty({
        example: 'Michael De Santa',
    })
    @IsString()
    @MinLength(5)
    fullName: string;

    @ApiProperty({
        example: '+998901234567',
    })
    @IsString()
    @IsPhoneNumber('UZ')
    phone: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({
        type: 'string',
        format: 'binary'
    })
    @IsOptional()
    file: any;
}