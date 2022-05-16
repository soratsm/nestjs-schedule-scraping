import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { DomainService } from '@/symbols/domain/domain.service';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  constructor(private readonly domainService: DomainService) {}

  // 間隔指定'*/30 * * * * *'で30秒ごと
  // 間隔指定'*/10 * * * *'で10分ごと
  // 間隔指定'*/5 * * * *'で5分ごと
  // 間隔指定'0 * * * *'で毎時0分に実行
  @Cron('*/10 * * * *')
  async scheduleForDomainOfFetchAndSaveSymbolData() {
    this.logger.debug('Started "fetchAndSaveSymbolData"');
    await this.domainService.fetchAndSaveSymbolData();
    this.logger.debug('Finished "fetchAndSaveSymbolData"');
  }
}
