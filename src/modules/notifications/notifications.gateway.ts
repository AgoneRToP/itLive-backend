import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    
    // In handleConnection, the guard hasn't run yet for events, 
    // but we can parse the token manually or require clients to emit a 'join' event.
    // Let's use a standard 'join_notifications' event for them to subscribe to their own room.
  }

  @SubscribeMessage('join_notifications')
  handleJoinNotifications(client: Socket) {
    const user = (client as any).user;
    if (user && user.id) {
      client.join(`user_${user.id}`);
      console.log(`User ${user.id} joined notifications room`);
      
      // If admin, they might also join an 'admins' room
      if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
        client.join('admins');
      }
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
  
  emitNewNotification(notification: any) {
    // If recipientId is present, emit to that user's room
    if (notification.recipientId) {
      this.server.to(`user_${notification.recipientId}`).emit('newNotification', notification);
    } else {
      // If no recipientId, it might be a broadcast or admin notification
      this.server.to('admins').emit('newNotification', notification);
    }
  }
}
