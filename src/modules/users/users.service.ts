import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Status, UserRoles } from "@prisma/client";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { randomUUID } from "node:crypto";
import * as argon from "argon2"

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async getAllAdmins(statusParam?: Status) {
    const status = statusParam || Status.ACTIVE;
    const admins = await this.prisma.user.findMany({
      where: { 
        role: UserRoles.ADMIN,
        status,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        file: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      success: true,
      data: admins,
    };
  }

  async getCountByRolesAndCourses() {
    const [dbResult, totalCourses] = await Promise.all([
      this.prisma.user.groupBy({
        by: ["role"],
        where: {
          role: {
            not: UserRoles.SUPERADMIN,
          },
        },
        _count: {
          _all: true,
        },
      }),
      this.prisma.courses.count(),
    ]);

    const countsMap = dbResult.reduce(
      (acc, item) => {
        acc[item.role] = item._count._all;
        return acc;
      },
      {} as Record<string, number>,
    );

    const filterRoles = Object.values(UserRoles).filter(
      (role) => role !== UserRoles.SUPERADMIN,
    );

    const rolesStats: Record<string, number> = {};
    filterRoles.forEach((role) => {
      rolesStats[role] = countsMap[role] || 0;
    });

    return {
      dashboard: { ...rolesStats, totalCourses },
    };
  }

  async createAdmin(payload: CreateUserDto, file?: Express.Multer.File) {
    const existingUser = await this.prisma.user.findFirst({
      where: { phone: payload.phone },
    });

    if (existingUser) {
      throw new ConflictException("Bu telefon raqami allaqachon ro'yxatdan o'tgan");
    }

    const hashedPassword = await argon.hash(payload.password);
    const { permissions, ...restPayload } = payload;

    try {
      const newAdmin = await this.prisma.user.create({
        data: {
          ...restPayload,
          permissions: permissions as any,
          password: hashedPassword,
          file: file?.filename,
          role: UserRoles.ADMIN,
        },
      });

      return { success: true, data: newAdmin };
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new ConflictException("Bu telefon raqami allaqachon band");
      }
      throw error;
    }
  }

  async updateAdmin(
    id: number,
    payload: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    const existingAdmin = await this.prisma.user.findFirst({ where: { id } });

    if (!existingAdmin) throw new NotFoundException("Admin is not found");

    const admin = await this.prisma.user.findFirst({
      where: { role: UserRoles.ADMIN, phone: payload.phone, id: { not: id } },
    });

    if (admin)
      throw new ConflictException(
        "Bu telefon raqami boshqa admin tomonidan band qilingan",
      );

    const { file: _ignore, password, permissions, ...rest } = payload as any;
    const updatedAdmin = await this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(permissions && { permissions: permissions as any }),
        ...(password && { password: await argon.hash(password) }),
        ...(file && { file: file.filename }),
      },
    });

    return {
      success: true,
      data: updatedAdmin,
    };
  }


    async deleteAdmin(id: number) {
    const existingAdmin = await this.prisma.user.findFirst({ where: { id } });

    if (!existingAdmin) throw new NotFoundException("Admin is not found");

    await this.prisma.user.update({ where: { id }, data: { status: 'DELETED' } });

    return {
      success: true,
      data: existingAdmin,
    };
  }

    async archiveAdmin(id: number) {
    const admin = await this.prisma.user.findFirst({
      where: {
        id,
        role: UserRoles.ADMIN,
      },
    });

    if (!admin) {
      throw new NotFoundException("Admin is not found");
    }

    const updatedAdmin = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        status: Status.INACTIVE,
      },
    });

    return {
      success: true,
      data: updatedAdmin,
    };
  }

  async restoreAdmin(id: number) {
    const admin = await this.prisma.user.findFirst({
      where: {
        id,
        role: UserRoles.ADMIN,
      },
    });

    if (!admin) {
      throw new NotFoundException("Admin is not found");
    }

    const updatedAdmin = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        status: Status.ACTIVE,
      },
    });

    return {
      success: true,
      data: updatedAdmin,
    };
  }


  private generateFileName(file: Express.Multer.File) {
    const ext = file?.originalname?.split(".")?.at(-1);
    const uuid = randomUUID();
    return `${file.originalname}_${uuid}.${ext}`;
  }
}
