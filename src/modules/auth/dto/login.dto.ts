import { ApiProperty } from "@nestjs/swagger";
import {
  IsPhoneNumber,
  IsString,
} from "class-validator";

export class LoginDto {
  @ApiProperty({
    example: "+998975661099"
  })
  @IsString()
  @IsPhoneNumber()
  phone!: string;

  @ApiProperty({
    example: "SHAPTOLI"
  })
  @IsString()
  password!: string;
}
