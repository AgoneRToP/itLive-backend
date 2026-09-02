import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    this.logger.error(`[Prisma Error ${exception.code}]: ${message}`);

    switch (exception.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        response.status(status).json({
          statusCode: status,
          message: `Ma'lumotlar bazasida bunday qiymat (Unique constraint) allaqachon mavjud. Iltimos boshqasini kiriting.`,
          error: 'Conflict',
          meta: exception.meta,
        });
        break;
      }
      case 'P2003': {
        const status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
          statusCode: status,
          message: `Ushbu ma'lumotni o'chirish yoki o'zgartirish mumkin emas, chunki u boshqa ma'lumotlarga bog'langan (Foreign key constraint).`,
          error: 'Bad Request',
          meta: exception.meta,
        });
        break;
      }
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          message: `Qidirilayotgan ma'lumot bazada topilmadi.`,
          error: 'Not Found',
          meta: exception.meta,
        });
        break;
      }
      default:
        // Default 500 error for unhandled known Prisma errors
        super.catch(exception, host);
        break;
    }
  }
}
