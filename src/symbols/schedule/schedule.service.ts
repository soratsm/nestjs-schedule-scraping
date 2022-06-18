import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { DomainService } from '@/symbols/domain/domain.service';

/**
 * 定期実行
 * {@link https://crontab.guru/examples.html CronExamples}
 */

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  constructor(private readonly domainService: DomainService) {}

  @Cron('*/30 * * * *')
  async scheduleForDomainOfFetchAndSaveSymbolData() {
    this.logger.debug('Started "fetchAndSaveSymbolData"');
    await this.domainService.fetchAndSaveSymbolData();
    this.logger.debug('Finished "fetchAndSaveSymbolData"');
  }
}
