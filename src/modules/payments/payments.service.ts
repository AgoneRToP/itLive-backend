import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PrismaService } from "src/core/database/prisma.service";
import { Current } from "../courses/courses.service";
import { Status } from "@prisma/client";

import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) { }

  async checkCoursePurchased(courseId: number, userId: number) {
    const course = await this.prisma.courses.findUnique({
      where: {
        id: courseId,
      },
    });
    if (!course) {
      throw new HttpException("Course not found", HttpStatus.NOT_FOUND);
    }
    if (course.status === "INACTIVE") {
      throw new HttpException(
        "Ushbu kurs nofaol holatda va uni sotib olib bo'lmaydi",
        HttpStatus.BAD_REQUEST,
      );
    }
    const purchased = await this.prisma.payments.findFirst({
      where: {
        courseId: courseId,
        userId: userId,
      },
    });
    if (purchased) {
      throw new HttpException(
        "This course already purchased",
        HttpStatus.BAD_REQUEST,
      );
    }
    return { purchased, course };
  }

  async create(payload: CreatePaymentDto) {
    const { course } = await this.checkCoursePurchased(
      payload.courseId,
      payload.userId,
    );
    return this.prisma.payments.create({
      data: {
        courseId: payload.courseId,
        userId: payload.userId,
        amount: Number(course.price),
        isActive: Status.ACTIVE,
      },
    });
  }

  async findAll(isActiveParam?: Status) {
    const isActive = isActiveParam;
    const payments = await this.prisma.payments.findMany({
      where: { isActive },
      include: { course: true, user: true },
      orderBy: [
        { status: 'asc' },
        { created_at: 'desc' },
      ],
    });

    return { success: true, data: payments };
  }

  async findOne(courseId: number, userId: number) {
    const purchased = await this.prisma.payments.findFirst({
      where: {
        courseId: courseId,
        userId: userId,
      },
    });
    if (!purchased) {
      throw new HttpException(
        "This course has not been purchased",
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      success: true,
      data: purchased,
    };
  }

  async update(courseId: number, userId: number) {
    try {
      const { data: purchased } = await this.findOne(courseId, userId);

      if (purchased.status === true) {
        await this.prisma.payments.update({
          where: { id: purchased.id },
          data: { status: false },
        });

        return {
          success: true,
          message: "Payment status successfully updated to PENDING",
        };
      } else {
        await this.prisma.payments.update({
          where: { id: purchased.id },
          data: { status: true },
        });

        const course = await this.prisma.courses.findUnique({ where: { id: courseId } });

        await this.notificationsService.create(
          'To\'lov qabul qilindi',
          `Tabriklaymiz, sizning "${course?.name || 'Kurs'}" kursi uchun to'lovingiz muvaffaqiyatli qabul qilindi!`,
          'PAYMENT_SUCCESS',
          userId,
          '/dashboard/courses'
        );

        return {
          success: true,
          message: "Payment status successfully updated to COMPLETED",
        };
      }
    } catch (error) {
      throw new NotFoundException("Payment not found");
    }
  }

  async remove(courseId: number, user: Current) {
    try {
      const { data: purchased } = await this.findOne(courseId, user.id);
      return this.prisma.payments.delete({ where: { id: purchased.id } });
    } catch (error) {
      throw new NotFoundException(`Payment not found`);
    }
  }

  async findOneById(id: number) {
    const payment = await this.prisma.payments.findUnique({
      where: { id },
      include: { course: true, user: true },
    });
    if (!payment) throw new NotFoundException("Payment not found");
    return payment;
  }

  async updateById(id: number, payload: UpdatePaymentDto) {
    await this.findOneById(id);
    return this.prisma.payments.update({
      where: { id },
      data: payload,
      include: { course: true, user: true },
    });
  }

  async removeById(id: number) {
    await this.findOneById(id);
    return this.prisma.payments.delete({ where: { id } });
  }
}
