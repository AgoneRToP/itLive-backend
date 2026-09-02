import { Body, Controller, Param, ParseIntPipe, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/register/:courseId")
  register(@Body() payload: RegisterDto, @Param('courseId') courseId: number) {
    return this.authService.register(payload, courseId);
  }

  @Post("/login")
  async login(@Body() payload: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(payload);
    if (result.tokens.accessToken) {
      res.cookie("accessToken", result.tokens.accessToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        // Eslatma: Agar HTTPS bo'lmasa cross-origin cookie ishlamasligi mumkin.
        // Hozircha http da ishlashi uchun sameSite lax va secure false qilinadi.
        sameSite: 'lax',
        secure: false,
      });
    }
    return result;
  }
}
