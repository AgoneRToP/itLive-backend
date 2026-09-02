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
  namespace: '/exam',
})
export class ExamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {}
  handleDisconnect(client: Socket) {}

  @SubscribeMessage('start_exam')
  handleStartExam(
    @MessageBody() data: { attemptId: number; lessonId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (user && user.id) {
      client.join(`exam_${data.attemptId}`);
      
      // Notify admins that student started exam
      this.server.to('admins').emit('student_started_exam', {
        userId: user.id,
        attemptId: data.attemptId,
        lessonId: data.lessonId,
        time: new Date()
      });
    }
  }

  @SubscribeMessage('exam_tick')
  handleExamTick(
    @MessageBody() data: { attemptId: number; timeRemaining: number; currentQuestion: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (user && user.id) {
      // Stream live progress to admins
      this.server.to('admins').emit('student_exam_progress', {
        userId: user.id,
        attemptId: data.attemptId,
        timeRemaining: data.timeRemaining,
        currentQuestion: data.currentQuestion
      });
    }
  }

  @SubscribeMessage('submit_exam')
  handleSubmitExam(
    @MessageBody() data: { attemptId: number; score: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (user && user.id) {
      this.server.to('admins').emit('student_submitted_exam', {
        userId: user.id,
        attemptId: data.attemptId,
        score: data.score,
        time: new Date()
      });
      client.leave(`exam_${data.attemptId}`);
    }
  }
}
