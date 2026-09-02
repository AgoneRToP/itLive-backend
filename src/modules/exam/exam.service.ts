    import { Injectable, NotFoundException } from "@nestjs/common";
    import { PrismaService } from "../../core/database/prisma.service";
    import { CreateExamDto } from "./dto/create-exam.dto";
    import { UpdateExamDto } from "./dto/update-exam.dto";

    @Injectable()
    export class ExamService {
      constructor(private prisma: PrismaService) {}
      async getAll(lessonId?: number) {
        const exam = await this.prisma.exams.findMany({
          where: lessonId ? { lessonId } : undefined,
          orderBy: { created_at: "desc" },
        });

        return {
          success: true,
          data: exam,
        };
      }

      async getOne(id: number) {
        const exam = await this.prisma.exams.findUnique({
          where: { id },
        });
        if (!exam) {
          throw new NotFoundException("Exam not found");
        }
        return {
          success: true,
          data: exam,
        };
      }

      async create(dto: CreateExamDto, userId: number) {
        const lesson = await this.prisma.lessons.findUnique({
          where: { id: dto.lessonId },
        });
        if (!lesson) {
          throw new NotFoundException("lesson not found");
        }
        const exam = await this.prisma.exams.create({ data: {...dto, userId} });
        return {
          success: true,
          message: "Exam successfully created",
          data: exam,
        };
      }

      async update(id: number, dto: UpdateExamDto) {
        await this.getOne(id);
        const exam = await this.prisma.exams.update({
          where: { id },
          data: dto,
        });
        return {
          success: true,
          message: "Exam successfully updated",
          data: exam,
        };
      }

      async delete(id: number) {
        await this.getOne(id);
        await this.prisma.exams.delete({ where: { id } });
        return {
          success: true,
          message: "Exam successfully deleted",
        };
      }
    }
