import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import * as fs from "fs/promises";
import { CourseFiles } from "./courses.controller";
import { Status, UserRoles } from "@prisma/client";

export interface Current {
    id: number;
    role: UserRoles;
}

@Injectable()
export class CoursesService {
    constructor(private readonly prisma: PrismaService) {}

    findAll(page = 1, limit = 10, statusParam?: Status) {
        const status = statusParam || Status.ACTIVE;

        return this.prisma.courses.findMany({
            where: { status },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                categories: true,
                sections: true,
                user: true,
                payments: true,
            },
            orderBy: { created_at: "desc" },
        });
    }

    findMyCourses(mentorId: number) {
        return this.prisma.courses.findMany({
            where: {
                teacherId: mentorId,
                status: { not: Status.DELETED },
            },
            include: {
                categories: true,
                sections: true,
                user: true,
                payments: true,
            },
            orderBy: { created_at: "desc" },
        });
    }

    async findOne(id: number) {
        const course = await this.prisma.courses.findFirst({
            where: {
                id,
                status: {
                    not: "DELETED",
                },
            },
            include: {
                categories: true,
                sections: {
                    include: {
                        lessons: {
                            include: {
                                materials: true,
                                homeworks: true,
                                exams: true,
                            },
                        },
                    },
                    orderBy: { created_at: "asc" },
                },
                user: true,
                payments: true,
            },
        });

        if (!course) throw new NotFoundException(`Kurs topilmadi (id: ${id})`);

        return course;
    }

    async create(dto: CreateCourseDto, files: CourseFiles, user: Current) {
        const bannerFile = files.banner?.[0];
        const introVideoFile = files.introVideo?.[0];

        if (!bannerFile) {
            throw new BadRequestException("Banner file is required");
        }

        try {
            const category = await this.prisma.categories.findUnique({
                where: { id: dto.categoryId },
            });
            if (!category) {
                throw new NotFoundException(
                    `Kategoriya topilmadi (id: ${dto.categoryId})`,
                );
            }

            const { banner, introVideo, ...rest } = dto;

            return await this.prisma.courses.create({
                data: {
                    ...rest,
                    teacherId:
                        user.role === UserRoles.MENTOR
                            ? user.id
                            : (dto.teacherId ?? null),
                    banner: `/uploads/banners/${bannerFile.filename}`,
                    introVideo: introVideoFile
                        ? `/uploads/videos/${introVideoFile.filename}`
                        : null,
                },
                include: {
                    categories: true,
                    sections: true,
                    user: true,
                    payments: true,
                },
            });
        } catch (error: any) {
            await this.deleteUploadedFiles([bannerFile, introVideoFile]);
            if (error.code === "P2002") {
                throw new ConflictException(
                    "Bu nomdagi kurs allaqachon mavjud",
                );
            }
            throw error;
        }
    }

    async update(
        id: number,
        dto: UpdateCourseDto,
        files: CourseFiles,
        user: Current,
    ) {
        const existing = await this.findOne(id);
        const bannerFile = files?.banner?.[0];
        const introVideoFile = files?.introVideo?.[0];

        const hasStudents = await this.prisma.payments.findFirst({
            where: { courseId: id, status: true },
        });

        if (hasStudents) {
            const updateKeys = Object.keys(dto).filter(
                (key) => key !== "status" && (dto as any)[key] !== undefined,
            );
            if (updateKeys.length > 0 || bannerFile || introVideoFile) {
                throw new ConflictException(
                    "Bu kurs sotib olinganligi sababli, faqat uning statusini (Active/Inactive) o'zgartirish mumkin.",
                );
            }
        }

        try {
            if (dto.categoryId) {
                const category = await this.prisma.categories.findUnique({
                    where: { id: dto.categoryId },
                });
                if (!category) {
                    throw new NotFoundException(
                        `Category not found (id: ${dto.categoryId})`,
                    );
                }
            }

            const { banner, introVideo, ...rest } = dto;

            const updated = await this.prisma.courses.update({
                where: { id },
                data: {
                    ...rest,
                    ...(dto.teacherId !== undefined && {
                        teacherId: dto.teacherId,
                    }),
                    ...(bannerFile && {
                        banner: `/uploads/banners/${bannerFile.filename}`,
                    }),
                    ...(introVideoFile && {
                        introVideo: `/uploads/videos/${introVideoFile.filename}`,
                    }),
                },
                include: {
                    categories: true,
                    sections: true,
                    user: true,
                    payments: true,
                },
            });

            const oldPaths: string[] = [];
            if (bannerFile && existing.banner) {
                oldPaths.push(`.${existing.banner}`);
            }
            if (introVideoFile && existing.introVideo) {
                oldPaths.push(`.${existing.introVideo}`);
            }
            if (oldPaths.length) {
                await this.deleteFilesByPath(oldPaths);
            }

            return updated;
        } catch (error: any) {
            await this.deleteUploadedFiles([bannerFile, introVideoFile]);
            if (error.code === "P2002") {
                throw new ConflictException(
                    "Bu nomdagi kurs allaqachon mavjud",
                );
            }
            throw error;
        }
    }

    async remove(id: number) {
        const existing = await this.findOne(id);

        const hasStudents = await this.prisma.payments.findFirst({
            where: { courseId: id, status: true },
        });

        if (hasStudents) {
            throw new ConflictException(
                "Bu kurs sotib olingan va o'quvchilarga ega. O'chirishdan oldin o'quvchilarni uzishingiz kerak.",
            );
        }

        try {
            return await this.prisma.courses.update({
                where: { id },
                data: { status: "DELETED" },
            });
        } catch (error) {
            throw new ConflictException(
                "Bu kursni o'chirish mumkin emas, unga bog'liq ma'lumotlar mavjud",
            );
        }
    }

    private async deleteUploadedFiles(
        files: (Express.Multer.File | undefined)[],
    ) {
        await Promise.all(
            files
                .filter((f): f is Express.Multer.File => !!f?.path)
                .map((f) =>
                    fs
                        .unlink(f.path)
                        .catch((err) =>
                            console.error(
                                `Faylni o'chirib bo'lmadi: ${f.path}`,
                                err.message,
                            ),
                        ),
                ),
        );
    }
    private async deleteFilesByPath(paths: string[]) {
        await Promise.all(
            paths.map((filePath) =>
                fs
                    .unlink(filePath)
                    .catch((err) =>
                        console.error(
                            `Eski faylni o'chirib bo'lmadi: ${filePath}`,
                            err.message,
                        ),
                    ),
            ),
        );
    }

  async archive(id: number) {
    const course = await this.prisma.courses.findFirst({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Kurs topilmadi (id: ${id})`);
    }
    const updated = await this.prisma.courses.update({
      where: { id },
      data: { status: Status.INACTIVE },
    });
    return { success: true, data: updated };
  }

  async restore(id: number) {
    const course = await this.prisma.courses.findFirst({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Kurs topilmadi (id: ${id})`);
    }
    const updated = await this.prisma.courses.update({
      where: { id },
      data: { status: Status.ACTIVE },
    });
    return { success: true, data: updated };
  }
}
