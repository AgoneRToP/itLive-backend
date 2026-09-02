import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateCourseAssistantDto } from "./dto/create-course-assistant.dto";
import { UpdateCourseAssistantDto } from "./dto/update-course-assistant.dto";
import { Status, UserRoles } from "@prisma/client";

@Injectable()
export class CourseAssistantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseAssistantDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException("Foydalanuvchi topilmadi");
    }

    if (user.role !== UserRoles.ASSISTANT) {
      throw new BadRequestException("Tanlangan foydalanuvchi assistent emas");
    }

    return this.prisma.courseAssistant.create({
      data: dto,
      include: {
        user: true,
      },
    });
  }

  async findAll(statusParam?: string) {
    const status = (statusParam as Status) || Status.ACTIVE;
    return this.prisma.courseAssistant.findMany({
      where: { status },
      include: { user: true },
    });
  }

  async findOne(id: number) {
    const assistant = await this.prisma.courseAssistant.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!assistant) {
      throw new NotFoundException("Course Assistant not found");
    }

    return assistant;
  }

  async update(id: number, dto: UpdateCourseAssistantDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException("Foydalanuvchi topilmadi");
    }

    if (user.role !== UserRoles.ASSISTANT) {
      throw new BadRequestException("Tanlangan foydalanuvchi assistent emas");
    }

    return this.prisma.courseAssistant.update({
      where: { id },
      data: dto,
      include: {
        user: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.courseAssistant.delete({
      where: { id },
    });
  }
}
