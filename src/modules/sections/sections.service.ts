import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import { UpdateSectionDto } from "./dto/update-section.dto";
import { error } from "console";
import { UserRoles } from "@prisma/client";

@Injectable()
export class SectionsService {
    constructor(private readonly prisma: PrismaService) {}

    findAll(user?: { id: number; role: UserRoles }) {
        return this.prisma.sections.findMany({
            where:
                user?.role === UserRoles.MENTOR
                    ? { courses: { teacherId: user.id } }
                    : undefined,
            include: { courses: true },
            orderBy: { created_at: "desc" },
        });
    }

    async findOne(id: number) {
        const section = await this.prisma.sections.findUnique({
            where: { id },
            include: { courses: true, lessons: true },
        });

        if (!section)
            throw new NotFoundException(`Bo'lim topilmadi (id: ${id})`);

        return section;
    }

    async create(dto: CreateSectionDto) {
        const category = await this.prisma.courses.findUnique({
            where: { id: dto.courseId },
        });

        if (!category)
            throw new NotFoundException(`Kurs topilmadi (id: ${dto.courseId})`);

        return this.prisma.sections.create({
            data: dto,
            include: { courses: true },
        });
    }

    async update(id: number, dto: UpdateSectionDto) {
        try {
            await this.findOne(id);

            return this.prisma.sections.update({
                where: { id },
                data: dto,
                include: { courses: true },
            });
        } catch (error) {
            throw new NotFoundException(`Bo'lim topilmadi (id: ${id})`);
        }
    }

    async remove(id: number) {
        try {
            await this.findOne(id);
            return this.prisma.sections.delete({ where: { id } });
        } catch (error) {
            throw new NotFoundException(`Bo'lim topilmadi (id: ${id})`);
        }
    }
}
