import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateCommentsDto } from "./dto/create-comments";
import { UpdateCommentsDto } from "./dto/update-comments";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateCommentsDto) {
    const comment = await this.prisma.comments.create({
      data: dto,
    });

    // Emit notification
    await this.notificationsService.create(
      "Yangi xabar",
      `${dto.fullName} qoldirdi: ${dto.message.substring(0, 50)}${dto.message.length > 50 ? "..." : ""}`,
      "COMMENT",
    );

    return comment;
  }

  async findAll() {
    return await this.prisma.comments.findMany({
      orderBy: { created_at: "desc" },
    });
  }

  async findOne(id: number) {
    const comment = await this.prisma.comments.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException("Comment not found");
    }
    return { success: true, data: comment };
  }

  async update(id: number, dto: UpdateCommentsDto) {
    const existing = await this.prisma.comments.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException("Comment not found");
    }

    return await this.prisma.comments.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: number) {
    const existing = await this.prisma.comments.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException("Comment not found");
    }

    await this.prisma.comments.delete({
      where: { id },
    });
    return { success: true, message: "Comment deleted" };
  }
}
