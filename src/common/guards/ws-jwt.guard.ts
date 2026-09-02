import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    
    // Look for token in auth payload or headers
    const authHeader = client.handshake.headers.authorization;
    const authPayload = client.handshake.auth?.token;
    
    let token = '';
    
    if (authPayload) {
      token = authPayload;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // Sometimes clients send it in query params
      token = client.handshake.query?.token as string;
    }

    if (!token) {
      throw new UnauthorizedException('Authentication token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('SECRET_KEY'),
      });

      // Attach user payload to socket
      (client as any).user = payload;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    return true;
  }
}
