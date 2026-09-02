import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import * as fs from "fs/promises";
import * as path from "path";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import * as argon2 from "argon2";
import { ChangePasswordDto } from "./dto/change-password";

@Injectable()
export class ProfileService {
    constructor(private readonly prisma: PrismaService) {}

    async updateProfile(
        userId: number,
        dto: UpdateProfileDto,
        avatar?: Express.Multer.File,
    ) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException("Foydalanuvchi topilmadi");
        }

        if (avatar && user.file) {
            const oldAvatarPath = path.join(process.cwd(), user.file);
            try {
                await fs.access(oldAvatarPath);
                await fs.unlink(oldAvatarPath);
            } catch (error) {}
        }

        const updateData: any = {};

        if (avatar) {
            updateData.file = `/uploads/avatars/${avatar.filename}`;
        }
        if (dto.fullName !== undefined) {
            updateData.fullName = dto.fullName;
        }
        if (dto.phone !== undefined) {
            updateData.phone = dto.phone;
        }
        if (dto.email !== undefined) {
            updateData.email = dto.email;
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        const mentorFields = [
            "job",
            "experience",
            "description",
            "site",
            "telegram",
            "instagram",
            "facebook",
            "linkedin",
            "github",
        ];
        const mentorData = Object.fromEntries(
            mentorFields
                .filter((field) => (dto as any)[field] !== undefined)
                .map((field) => [field, (dto as any)[field]]),
        );
        if (
            updatedUser.role === "MENTOR" &&
            Object.keys(mentorData).length > 0
        ) {
            const mentor = await this.prisma.mentorProfile.findFirst({
                where: { userId },
            });
            if (mentor) {
                await this.prisma.mentorProfile.update({
                    where: { id: mentor.id },
                    data: mentorData,
                });
            } else {
                await this.prisma.mentorProfile.create({
                    data: { userId, ...mentorData },
                });
            }
        }

        return {
            message: "Profil muvaffaqiyatli yangilandi",
            data: {
                id: updatedUser.id,
                fullName: updatedUser.fullName,
                phone: updatedUser.phone,
                email: updatedUser.email,
                file: updatedUser.file,
                role: updatedUser.role,
                created_at: updatedUser.created_at,
                updated_at: updatedUser.updated_at,
            },
        };
    }

    async getProfile(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { mentor: true },
        });

        if (!user) {
            throw new NotFoundException("Foydalanuvchi topilmadi");
        }

        return {
            message: "Profil ma'lumotlari",
            data: {
                id: user.id,
                fullName: user.fullName,
                phone: user.phone,
                email: user.email,
                file: user.file,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at,
                mentor: user.mentor?.[0] ?? null,
            },
        };
    }

    async changePassword(userId: number, dto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) throw new BadRequestException("Foydalanuvchi topilmadi");

        const isMatch = await argon2.verify(user.password, dto.oldPassword);
        if (!isMatch) {
            throw new BadRequestException("Joriy parol noto'g'ri kiritildi");
        }

        const hashedPassword = await argon2.hash(dto.newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { success: true, message: "Parol muvaffaqiyatli o'zgartirildi" };
    }
}
