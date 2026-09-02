import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
import { Status, User, UserRoles } from "@prisma/client";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RedisService } from "src/common/redis/redis.service";
import { PaymentsService } from "../payments/payments.service";
import { JWTAccessOptions, JWTRefreshOptions } from "src/common/config/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly payments: PaymentsService,
  ) {}

  private async hashPassword(password: string) {
    return await argon.hash(password);
  }

  private async verifyPassword(
    hashedPassword: string,
    originalPassword: string,
  ) {
    return await argon.verify(hashedPassword, originalPassword);
  }

  async generateToken(
    user: Pick<User, "id" | "role">,
    accessTokenOnly?: boolean,
  ) {
    const tokens: { accessToken?: string; refreshToken?: string } = {
      accessToken: undefined,
      refreshToken: undefined,
    };

    tokens.accessToken = await this.jwtService.signAsync(
      {
        id: user.id,
        role: user.role,
      },
      JWTAccessOptions,
    );
    if (!accessTokenOnly) {
      tokens.refreshToken = await this.jwtService.signAsync(
        {
          id: user.id,
        },
        JWTRefreshOptions,
      );
    } else {
      delete tokens.refreshToken;
    }

    return tokens;
  }

  async register(payload: RegisterDto, courseId: number) {
    const existing = await this.prisma.user.findFirst({
      where: {
        phone: payload.phone,
      },
    });

    if (existing) {
      throw new ConflictException(
        "Bunday raqamli foydalanuvchi allaqachon mavjud!",
      );
    }

    const redisKey = `reg_${payload.phone}`;
    const storedOtp = await this.redisService.get(redisKey);

    // Development mode - allow test OTP
    const testOtp = process.env.NODE_ENV === "development" ? "000000" : null;

    if (!storedOtp && !testOtp) {
      throw new HttpException(
        "Noto'g'ri yoki muddati o'tgan tasdiqlash kodi",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check OTP validity
    if (storedOtp && storedOtp !== payload.otp && payload.otp !== testOtp) {
      throw new HttpException(
        "Noto'g'ri yoki muddati o'tgan tasdiqlash kodi",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Delete OTP after successful verification to prevent reuse
    if (storedOtp) {
      await this.redisService.del(redisKey);
    }

    const hashedPassword = await this.hashPassword(payload.password);

    const user = await this.prisma.user.create({
      data: {
        fullName: payload.fullName,
        phone: payload.phone,
        password: hashedPassword,
        role: UserRoles.STUDENT,
      },
    });

    const { password, ...result } = user;

    try {
      const { course } = await this.payments.checkCoursePurchased(
        courseId,
        user.id,
      );

      await this.prisma.payments.create({
        data: {
          courseId,
          userId: user.id,
          amount: Number(course.price),
        },
      });

      return {
        data: result,
        tokens: await this.generateToken(user),
      };
    } catch (error) {
      await this.prisma.user.delete({ where: { id: user.id } });
      throw error;
    }
  }

  async login(payload: LoginDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        phone: payload.phone,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        password: true,
        file: true,
        role: true,
        status: true,
        payments: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException("Foydalanuvchi topilmadi");
    }

    if (existing.status !== Status.ACTIVE) {
      throw new ForbiddenException("Foydalanuvchi bloklangan yoki faol emas");
    }

    const isSame = await this.verifyPassword(
      existing.password,
      payload.password,
    );

    if (!isSame) {
      throw new BadRequestException("Parol xato");
    }

    if (
      existing.role === UserRoles.STUDENT &&
      existing.payments[0].status === false
    ) {
      throw new ForbiddenException();
    }

    const { password, ...result } = existing;

    return {
      success: true,
      tokens: await this.generateToken(result),
      data: result,
    };
  }
}
