import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateMaterialDto } from "./dto/create-material.dto";
import path from "node:path";
import fs from "node:fs";
import { UpdateMaterialDto } from "./dto/update-material.dto";

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.materials.findMany({
      include: {
        lessons: {
          include: {
            materials: true,
          },
        },
      },
    });
  }

  async findOne(lessonId: number) {
    const section = await this.prisma.materials.findMany({
      where: { lessonId },
      include: { lessons: true },
    });

    if (!section) throw new NotFoundException(`Material topilmadi (lesson_id: ${lessonId})`);

    return section;
  }

  async create(dto: CreateMaterialDto, files: Express.Multer.File[]) {
    const lesson = await this.prisma.lessons.findUnique({
      where: { id: Number(dto.lessonId) },
    });

    if (!lesson) {
      throw new NotFoundException(`Dars topilmadi (id: ${dto.lessonId})`);
    }

    const filePaths: string[] = files && files.length > 0 ? files.map(
      (file) => file.path || `uploads/${file.filename}`,
    ) : [];

    return this.prisma.materials.create({
      data: {
        lessonId: Number(dto.lessonId),
        title: dto.title,
        description: dto.description,
        file: filePaths,
      },
      include: { lessons: true },
    });
  }

  async update(
    id: number,
    dto: UpdateMaterialDto,
    files?: Express.Multer.File[],
  ) {
    const existingMaterial = await this.prisma.materials.findUnique({
      where: { id },
    });
    if (!existingMaterial) {
      throw new NotFoundException(`Material topilmadi (id: ${id})`);
    }

    if (dto.lessonId) {
      const lesson = await this.prisma.lessons.findUnique({
        where: { id: Number(dto.lessonId) },
      });
      if (!lesson) {
        throw new NotFoundException(`Dars topilmadi (id: ${dto.lessonId})`);
      }
    }

    const updateData: any = {
      title: dto.title,
      description: dto.description,
      lessonId: dto.lessonId ? Number(dto.lessonId) : undefined,
    };

    if (files && files.length > 0) {
      const oldFiles: string[] = existingMaterial.file;

      oldFiles.forEach((filePath) => {
        const fullPath = path.resolve(filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });

      const newFilePaths = files.map(
        (file) => file.path || `uploads/${file.filename}`,
      );

      updateData.file = newFilePaths;
    }

    return this.prisma.materials.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    const material = await this.prisma.materials.findUnique({ where: { id } });
    if (!material) throw new NotFoundException("Material topilmadi");

    const filesToDelete: string[] = material.file;

    filesToDelete.forEach((filePath) => {
      const fullPath = path.resolve(filePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    return this.prisma.materials.delete({ where: { id } });
  }
}
