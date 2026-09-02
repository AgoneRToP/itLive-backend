import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CourseCommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(courseId: number, userId: number, text: string, parentId?: number, lessonId?: number) {
    const course = await this.prisma.courses.findUnique({
      where: { id: courseId },
      include: { user: true }, // Include teacher info
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const comment = await this.prisma.courseComment.create({
      data: {
        text,
        courseId,
        userId,
        ...(parentId && { parentId }),
        ...(lessonId && { lessonId }),
      },
      include: {
        user: true,
        parent: true,
      },
    });

    const userFullName = comment.user.fullName || 'Student';
    const message = `${userFullName} posted a comment on course: ${course.name}`;
    const commentHash = `#comment-${parentId || comment.id}`;
    const link = lessonId ? `/students/${courseId}?lessonId=${lessonId}${commentHash}` : undefined;

    if (parentId && comment.parent && comment.parent.userId !== userId) {
      // It's a reply to someone, notify the person who asked
      await this.notificationsService.create(
        'New Reply',
        `${userFullName} replied to your question in course: ${course.name}`,
        'COMMENT_REPLY',
        comment.parent.userId,
        link
      );
    } else {
      // Notify ALL Admins (recipientId = null)
      await this.notificationsService.create('New Course Comment', message, 'COURSE_COMMENT', undefined, link);
  
      // Notify the Teacher specifically
      if (course.teacherId && course.teacherId !== userId) {
        await this.notificationsService.create('New Course Comment', message, 'COURSE_COMMENT', course.teacherId, link);
      }
    }

    return comment;
  }

  async findByCourseId(courseId: number) {
    return this.prisma.courseComment.findMany({
      where: { courseId, parentId: null },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            file: true,
            role: true,
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                file: true,
                role: true,
              }
            }
          },
          orderBy: { created_at: 'asc' }
        }
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
