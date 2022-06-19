import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { DomainService } from '@/symbols/domain/domain.service';

/**
 * 銘柄情報の取得更新処理の定期実行
 *
 * {@link https://crontab.guru/examples.html Cron Examples}
 *
 * {@link https://zenn.dev/kisihara_c/books/nest-officialdoc-jp/viewer/techniques-taskscheduling NestJS techniques-taskscheduling}
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
