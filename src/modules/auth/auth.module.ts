import { Module, forwardRef } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "src/core/database/prisma.module";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from "@nestjs/passport";
import { JwtAccessStrategy } from "src/common/strategies/jwt-access.strategy";
import { TokenConfig } from "src/common/config/token.config";
import { PaymentsModule } from "../payments/payments.module";

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt-access' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => PaymentsModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy, TokenConfig],
  exports: [JwtModule],
})
export class AuthModule {}
