import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CourseCommentsService } from './course-comments.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/qa',
})
export class QaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly courseCommentsService: CourseCommentsService) {}

  handleConnection(client: Socket) {
    console.log(`QA Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`QA Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_lesson')
  handleJoinLesson(
    @MessageBody() data: { courseId: number; lessonId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `course_${data.courseId}_lesson_${data.lessonId}`;
    client.join(room);
    console.log(`Client ${client.id} joined room: ${room}`);
    const user = (client as any).user;
    if (user) {
      this.server.to(room).emit('user_joined', { userId: user.id });
    }
  }

  @SubscribeMessage('leave_lesson')
  handleLeaveLesson(
    @MessageBody() data: { courseId: number; lessonId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `course_${data.courseId}_lesson_${data.lessonId}`;
    const user = (client as any).user;
    if (user) {
      this.server.to(room).emit('user_left', { userId: user.id });
    }
    client.leave(room);
    console.log(`Client ${client.id} left room: ${room}`);
  }

  @SubscribeMessage('send_question')
  async handleSendQuestion(
    @MessageBody() data: { courseId: number; lessonId: number; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) return;
    const room = `course_${data.courseId}_lesson_${data.lessonId}`;
    
    // Save to DB and trigger notifications
    const comment = await this.courseCommentsService.create(
      data.courseId,
      user.id, // Extracted securely from token
      data.text,
      undefined, // parentId
      data.lessonId
    );

    // Broadcast the newly created question back to everyone in the room
    this.server.to(room).emit('new_question', comment);
  }

  @SubscribeMessage('send_reply')
  async handleSendReply(
    @MessageBody() data: { courseId: number; lessonId: number; parentId: number; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) return;
    const room = `course_${data.courseId}_lesson_${data.lessonId}`;
    
    // Save to DB and trigger notifications (will notify the person who asked)
    const reply = await this.courseCommentsService.create(
      data.courseId,
      user.id,
      data.text,
      data.parentId,
      data.lessonId
    );

    // Broadcast the newly created reply back to everyone in the room
    this.server.to(room).emit('new_reply', reply);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { courseId: number; lessonId: number; isMentor: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) return;
    const room = `course_${data.courseId}_lesson_${data.lessonId}`;
    this.server.to(room).emit('user_typing', { userId: user.id, isMentor: data.isMentor });
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(
    @MessageBody() data: { courseId: number; lessonId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) return;
    const room = `course_${data.courseId}_lesson_${data.lessonId}`;
    this.server.to(room).emit('user_stop_typing', { userId: user.id });
  }
}
