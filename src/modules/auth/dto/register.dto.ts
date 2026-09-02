import { ApiProperty } from "@nestjs/swagger";
import { IsPhoneNumber, IsString, IsStrongPassword } from "class-validator";

export class RegisterDto {
  @ApiProperty({
    example: "Mr Kebyu",
  })
  @IsString()
  fullName!: string;

  @ApiProperty({
    example: "+998990007007",
  })
  @IsString()
  @IsPhoneNumber()
  phone!: string;

  @ApiProperty({
    example: "@Kebyu007",
  })
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "Parol juda kuchsiz (katta va kichik harflar, raqam va belgi talab qilinadi).",
    },
  )
  password!: string;

  @ApiProperty({
    example: '000000',
  })
  @IsString()
  otp: string;
}
