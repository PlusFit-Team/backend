import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Socket } from 'socket.io';

export const WsCurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient<Socket>();
    return client.data.user;
  },
);
