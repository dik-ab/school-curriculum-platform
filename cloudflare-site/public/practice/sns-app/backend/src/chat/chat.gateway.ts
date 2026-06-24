import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/jwt-payload';
import { ConversationsService } from './conversations.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: process.env.FRONTEND_URL },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly conversationsService: ConversationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token as string | undefined;
      if (token === undefined) throw new Error('トークンがありません');
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      client.data.user = payload;
      this.logger.log(`接続: ${payload.username}`);
    } catch {
      this.logger.warn('認証できない接続を切断しました');
      client.disconnect();
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: number },
  ) {
    const user = client.data.user as JwtPayload;
    const ok = await this.conversationsService.isParticipant(
      user.sub,
      payload.conversationId,
    );
    if (!ok) return;
    client.join(`conversation:${payload.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: number; content: string },
  ) {
    const user = client.data.user as JwtPayload;
    const content = payload.content?.trim();
    if (!content || content.length > 1000) return;
    const ok = await this.conversationsService.isParticipant(
      user.sub,
      payload.conversationId,
    );
    if (!ok) return;

    const message = await this.conversationsService.createMessage(
      user.sub,
      payload.conversationId,
      content,
    );
    this.server
      .to(`conversation:${payload.conversationId}`)
      .emit('newMessage', message);
  }
}
