# Backend Xavfsizlik Yaxshilashlari

## 🔴 Muhim Muammolar

### 1. .env fayli Git-ga qo'shilgan
**Muammo:** `.env` faylida maxfiy ma'lumotlar (passwords, keys) ochiq ko'rinmoqda
**Yechim:**
```bash
# .env faylini Git-dan o'chirish
git rm --cached .env
git commit -m "Remove .env from Git"

# .gitignore faylda .env borligini tekshirish
echo ".env" >> .gitignore
```

### 2. CORS ochiq holda
**Muammo:** `origin: '*'` barcha domainlardan so'rovlarga ruxsat beradi
**Yechim:**
```typescript
// src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### 3. Rate Limiting yo'q
**Muammo:** Brute force hujumlarga himoya yo'q
**Yechim:**
```bash
npm install @nestjs/throttler
```

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60000, // 1 daqiqa
        limit: 10,  // 10 ta so'rov
      }],
    }),
  ],
})
```

### 4. HTTP Headers Security yo'q
**Muammo:** XSS, clickjacking kabi hujumlarga himoya yo'q
**Yechim:**
```bash
npm install helmet
```

```typescript
// src/main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  // ...
}
```

### 5. Refresh Token Strategy yo'q
**Muammo:** Refresh token strategiyasi to'liq ishlamaydi
**Yechim:** `jwt-refresh.strategy.ts` yaratish kerak

## 🟡 O'rtacha Muhimlikdagi Yaxshilashlar

### 6. Password Complexity Validation
```typescript
// register.dto.ts
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
  message: 'Parol kamida 8 ta belgi, katta va kichik harflar, raqam va maxsus belgi bo\'lishi kerak',
})
password: string;
```

### 7. Input Sanitization
```bash
npm install class-sanitizer
```

### 8. API Request Logging
```typescript
// logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';

    this.logger.log(`${method} ${url} - ${ip} - ${userAgent}`);

    return next.handle();
  }
}
```

### 9. Error Handling Improvement
```typescript
// all-exceptions.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

## 🔐 JWT Token Yaxshilashlari

### Token Rotation Strategy
```typescript
// auth.service.ts
async refreshTokens(userId: number, refreshToken: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  // Eski refresh tokenni blacklist-ga qo'shish
  await this.redisService.set(`blacklist:${refreshToken}`, '1', 3600 * 24 * 7);

  // Yangi tokenlar yaratish
  return await this.generateToken(user);
}
```

## 📝 Environment Variables Xavfsizligi

### .env.example yangilash
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
ACCESS_SECRET_KEY=your_very_long_and_random_access_secret_key_here_at_least_32_characters
REFRESH_SECRET_KEY=your_very_long_and_random_refresh_secret_key_here_at_least_32_characters

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend
FRONTEND_URL=http://localhost:3000

# Admin
ADMIN_PASSWORD=strong_admin_password_here

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,video/mp4

# Server
PORT=3000
NODE_ENV=development
```

## 🛡️ Database Security

### Prisma Schema Yaxshilashlari
```prisma
// schema.prisma

// Indexlar qo'shish - performance uchun
model User {
  id       Int    @id @default(autoincrement())
  phone    String @unique
  email    String? @unique
  // ...
  
  @@index([phone])
  @@index([email])
  @@index([role])
}

model Courses {
  // ...
  @@index([categoryId])
  @@index([level])
  @@index([created_at])
}
```

## 🔍 Monitoring va Logging

### Winston Logger qo'shish
```bash
npm install nest-winston winston
```

```typescript
// logger.module.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.forRoot({
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});
```

## 📊 Health Check Endpoint
```bash
npm install @nestjs/terminus
```

```typescript
// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```
