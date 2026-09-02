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
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/presence',
})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track active users in memory (in production, use Redis)
  private activeUsers = new Map<number, { socketId: string; lastSeen: Date; currentLessonId?: number; progress?: number }>();

  async handleConnection(client: Socket) {
    // Client connects, guard will handle auth for events.
  }

  @SubscribeMessage('im_online')
  handleOnline(@ConnectedSocket() client: Socket) {
    const user = (client as any).user;
    if (user && user.id) {
      this.activeUsers.set(user.id, {
        socketId: client.id,
        lastSeen: new Date(),
      });
      console.log(`User ${user.id} is online`);
      
      // Notify admins/mentors about presence change
      this.server.to('admins').emit('user_status_change', { userId: user.id, status: 'online' });
    }
  }

  @SubscribeMessage('video_progress')
  handleVideoProgress(
    @MessageBody() data: { lessonId: number; progressPercentage: number; currentTime: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (user && user.id) {
      const userData = this.activeUsers.get(user.id);
      if (userData) {
        userData.currentLessonId = data.lessonId;
        userData.progress = data.progressPercentage;
        userData.lastSeen = new Date();
        this.activeUsers.set(user.id, userData);

        // Optionally emit to mentors monitoring this course/lesson
        this.server.to('admins').emit('user_progress_update', {
          userId: user.id,
          lessonId: data.lessonId,
          progressPercentage: data.progressPercentage,
          currentTime: data.currentTime,
        });
      }
    }
  }

  handleDisconnect(client: Socket) {
    const user = (client as any).user;
    if (user && user.id) {
      this.activeUsers.delete(user.id);
      this.server.to('admins').emit('user_status_change', { userId: user.id, status: 'offline' });
    }
  }

  // Utility method for services to get online users
  getActiveUsers() {
    return Array.from(this.activeUsers.entries()).map(([userId, data]) => ({
      userId,
      ...data,
    }));
  }
}
