import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";

@Injectable()
export class LessonsService {
    remove(id: number) {
        throw new Error("Method not implemented.");
    }
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateLessonDto) {
        return this.prisma.lessons.create({ data: dto as any });
    }

    async findAll() {
        return this.prisma.lessons.findMany({
            include: {
                sections: true,
                exams: true,
                materials: true,
                homeworks: true,
            },
        });
    }

    async findOne(id: number) {
        const lesson = await this.prisma.lessons.findUnique({
            where: { id },
            include: {
                sections: true,
                exams: true,
                materials: true,
                homeworks: true,
            },
        });

        if (!lesson) {
            throw new NotFoundException(`Lesson with id ${id} not found`);
        }

        return lesson;
    }

    async update(id: number, dto: UpdateLessonDto) {
        const existing = await this.findOne(id);

        if (dto.file && existing.file && dto.file !== existing.file) {
            this.deleteFileIfExists(existing.file);
        }

        const { file, ...lessonData } = dto as any;
        return this.prisma.lessons.update({
            where: { id },
            data: { ...lessonData, ...(file && { file }) },
        });
    }

    private deleteFileIfExists(relativePath: string) {
        const fullPath = join(process.cwd(), relativePath);

        if (existsSync(fullPath)) {
            unlinkSync(fullPath);
        }
    }
}
