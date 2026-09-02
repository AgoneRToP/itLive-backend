import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  async create(title: string, message: string, type: string = 'COMMENT', recipientId?: number, link?: string) {
    const notification = await this.prisma.notification.create({
      data: {
        title,
        message,
        type,
        recipientId,
        link,
      },
    });
    
    // Emit via WebSocket
    this.gateway.emitNewNotification(notification);
    
    return notification;
  }

  async findAllUnread(userId: number, role: string) {
    if (role === 'SUPERADMIN' || role === 'ADMIN') {
      return this.prisma.notification.findMany({
        where: { isRead: false, recipientId: null },
        orderBy: { created_at: 'desc' },
      });
    } else {
      return this.prisma.notification.findMany({
        where: { isRead: false, recipientId: userId },
        orderBy: { created_at: 'desc' },
      });
    }
  }

  async markAsRead(id: number, userId: number, role: string) {
    // Ideally we should check if this user is allowed to read it
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
