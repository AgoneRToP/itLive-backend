import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Status, UserRoles } from "@prisma/client";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateAssistantDto } from "./dto/create-assistant.dto";
import { UpdateAssistantDto } from "./dto/update-assistant.dto";
import { randomUUID } from "node:crypto";
import * as argon2 from "argon2";

@Injectable()
export class AssistantsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllAssistants(statusParam?: string) {
    const status = (statusParam as Status) || Status.ACTIVE;

    const assistants = await this.prisma.user.findMany({
      where: { role: UserRoles.ASSISTANT, status },
      select: {
        id: true,
        fullName: true,
        phone: true,
        file: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      success: true,
      data: assistants,
    };
  }

  async createAssistant(
    payload: CreateAssistantDto,
    file?: Express.Multer.File,
  ) {
    const existingUser = await this.prisma.user.findFirst({
      where: { phone: payload.phone },
    });

    if (existingUser) {
      throw new ConflictException(
        "Bu telefon raqami allaqachon ro'yxatdan o'tgan",
      );
    }

    const hashedPassword = await argon2.hash(payload.password);

    try {
      const newAssistant = await this.prisma.user.create({
        data: {
          ...payload,
          password: hashedPassword,
          file: file?.filename,
          role: UserRoles.ASSISTANT,
        },
      });

      return { success: true, data: newAssistant };
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new ConflictException("Bu telefon raqami allaqachon band");
      }
      throw error;
    }
  }

  async updateAssistant(
    id: number,
    payload: UpdateAssistantDto,
    file?: Express.Multer.File,
  ) {
    const existingAssistant = await this.prisma.user.findFirst({
      where: {
        id,
        role: UserRoles.ASSISTANT,
      },
    });

    if (!existingAssistant)
      throw new NotFoundException("Assistant is not found");

    const assistant = await this.prisma.user.findFirst({
      where: {
        role: UserRoles.ASSISTANT,
        phone: payload.phone,
        id: { not: id },
      },
    });

    if (assistant)
      throw new ConflictException(
        "Bu telefon raqami boshqa assistant tomonidan band qilingan",
      );

    const { file: _ignore, password, ...rest } = payload as any;
    const updatedAssistant = await this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(password && { password: await argon2.hash(password) }),
        ...(file && { file: file.filename }),
      },
    });

    return {
      success: true,
      data: updatedAssistant,
    };
  }

  async deleteAssistant(id: number) {
    const existingAssistant = await this.prisma.user.findFirst({
      where: {
        id,
        role: UserRoles.ASSISTANT,
      },
    });

    if (!existingAssistant)
      throw new NotFoundException("Assistant is not found");

    await this.prisma.user.delete({
      where: {
        id,
        role: UserRoles.ASSISTANT,
      },
    });

    return {
      success: true,
      data: existingAssistant,
    };
  }

  async archiveAssistant(id: number) {
    const assistant = await this.prisma.user.findFirst({
      where: {
        id,
        role: UserRoles.ASSISTANT,
      },
    });

    if (!assistant) {
      throw new NotFoundException("Assistant is not found");
    }

    const updatedAssistant = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        status: Status.INACTIVE,
      },
    });

    return {
      success: true,
      data: updatedAssistant,
    };
  }

  async restoreAssistant(id: number) {
    const assistant = await this.prisma.user.findFirst({
      where: {
        id,
        role: UserRoles.ASSISTANT,
      },
    });

    if (!assistant) {
      throw new NotFoundException("Assistant is not found");
    }

    const updatedAssistant = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        status: Status.ACTIVE,
      },
    });

    return {
      success: true,
      data: updatedAssistant,
    };
  }

  private generateFileName(file: Express.Multer.File) {
    const ext = file?.originalname?.split(".")?.at(-1);
    const uuid = randomUUID();
    return `${file.originalname}_${uuid}.${ext}`;
  }
}
