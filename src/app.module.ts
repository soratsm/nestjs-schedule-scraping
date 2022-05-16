import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { SymbolsModule } from '@/symbols/symbols.module';
import { ChatsModule } from '@/chats/chats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local'],
    }),
    ScheduleModule.forRoot(),
    ChatsModule,
    SymbolsModule,
  ],
  providers: [],
})
export class AppModule {}
