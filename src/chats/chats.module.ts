import { Module } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';

import { ChatsService } from '@/chats/chats.service';

@Module({
  providers: [PrismaService, ChatsService],
  // controllers: [ChatsController],
})
export class ChatsModule {}
