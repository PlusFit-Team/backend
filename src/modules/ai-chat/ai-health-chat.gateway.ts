import { WsCurrentUser } from '@decorators';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ICurrentUser } from '@type';
import { Server, Socket } from 'socket.io';

import { AiChatService } from './ai-health-chat.service';
import { GetUserChatsDto, SendMessageDto } from './dto';

@WebSocketGateway({
  cors: true,
  namespace: 'health-chat',
})
export class AiChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: AiChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env['JWT_ACCESS_SECRET_KEY'],
      });

      client.data.user = payload;
      console.log(`Health Chat - Client connected: ${client.id}`);
    } catch (error) {
      console.log('Health Chat - Connection failed:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    client.disconnect();
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() dto: SendMessageDto,
    @WsCurrentUser() user: ICurrentUser,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.sendMessage(
        dto,
        user,
        (chunk: string, isDone: boolean) => {
          client.emit('receiveMessage', { content: chunk, isDone });
        },
      );
    } catch (error) {
      console.log(error);
      client.emit('error', { message: error.message, where: 'sendMessage' });
    }
  }

  @SubscribeMessage('getUserChats')
  async handleGetUserChats(
    @MessageBody() dto: GetUserChatsDto,
    @WsCurrentUser() user: ICurrentUser,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      return this.chatService.getUserChats(dto, user);
    } catch (error) {
      console.log(error);
      client.emit('error', { message: error.message, where: 'getUserChats' });
    }
  }

  @SubscribeMessage('getChatMessages')
  async handleChatMessages(
    @MessageBody() dto: { chatId: string },
    @WsCurrentUser() user: ICurrentUser,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.getChatMessages(dto.chatId, user, (message) => {
        client.emit('receiveChatMessages', message);
      });
    } catch (error) {
      console.log(error);
      client.emit('error', {
        message: error.message,
        where: 'getChatMessages',
      });
    }
  }

  @SubscribeMessage('deleteChat')
  async handleDeleteChat(
    @MessageBody() dto: { chatId: string },
    @WsCurrentUser() user: ICurrentUser,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.deleteChat(dto.chatId, user);
      return { success: true };
    } catch (error) {
      console.log(error);
      client.emit('error', { message: error.message, where: 'deleteChat' });
    }
  }
}
