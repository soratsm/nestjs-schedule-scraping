import { Module } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';

import { ScheduleService } from '@/symbols/schedule/schedule.service';
import { ScrapingService } from '@/symbols/scraping/scraping.service';
import { DbService } from '@/symbols/db/db.service';
import { DomainService } from '@/symbols/domain/domain.service';

@Module({
  providers: [ScrapingService, DbService, PrismaService, DomainService, ScheduleService],
  imports: [],
  controllers: [],
})
export class SymbolsModule {}
