import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime';

import { ScrapingService } from '@/symbols/scraping/scraping.service';
import { DbService } from '@/symbols/db/db.service';
import { isEqual } from '@/utils/isEqual';

@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);

  constructor(
    private readonly scrapingService: ScrapingService,
    private readonly dbService: DbService,
  ) {}

  /**
   * 取得対象の銘柄選定し、関連情報の更新があればDBを更新する
   */
  async fetchAndSaveSymbolData(): Promise<void> {
    const symbolData = await this.dbService.readScrapingSymbolData();
    if (!symbolData) {
      this.logger.log('Target data does not exist.');
      return;
    } else {
      this.logger.debug(`Finished the readScrapingSymbolData.(Symbol : ${symbolData.id})`);
    }

    try {
      const isFirstScraping = !symbolData.explain as boolean;
      const { explain, country, hold, section } = await this.scrapingService.scrape(
        symbolData.id,
        isFirstScraping,
      );
      if (isFirstScraping) {
        // DBのSymbolExplainがない場合は初回登録
        await this.dbService.updateSymbol(symbolData.id);
        const createExplainData = {
          id: symbolData.id,
          name: explain.name ?? '',
          summary: explain.summary ?? '',
          comment: explain.comment ?? '',
          tags: explain.tags ?? '',
          issuer: explain.issuer ?? '',
          yield_per: explain.yield_per ?? (0.0 as unknown as Decimal),
          expense_per: explain.expense_per ?? (0.0 as unknown as Decimal),
          competing_etf: explain.competing_etf ?? '',
        };
        await this.dbService.createExplain(createExplainData);
        if (country) {
          await this.dbService.createCountry(country);
        }
        if (hold) {
          await this.dbService.createHold(hold);
        }
        if (section) {
          await this.dbService.createSection(section);
        }
        this.logger.log(`Added new data.(Symbol : ${symbolData.id})`);

        return;
      } else {
        // 各項目が不一致の場合更新を行う
        let updated = false;

        // 経費率・利回りの更新
        if (
          explain &&
          !isEqual(
            symbolData.explain.expense_per.toString() + symbolData.explain.yield_per.toString(),
            explain.expense_per.toString() + explain.yield_per.toString(),
          )
        ) {
          await this.dbService.updateExplain(symbolData.id, explain);
          updated = true;
          this.logger.log(`Updated Explain data.(Symbol : ${symbolData.id})`);
        }

        // 投資比率（国）の更新
        if (country && !isEqual(symbolData.country, country)) {
          await this.dbService.deleteCountry(symbolData.id);
          await this.dbService.createCountry(country);
          updated = true;
          this.logger.log(`Updated Country data.(Symbol : ${symbolData.id})`);
        }

        // 投資銘柄の更新
        if (hold && !isEqual(symbolData.hold, hold)) {
          await this.dbService.deleteHold(symbolData.id);
          await this.dbService.createHold(hold);
          updated = true;
          this.logger.log(`Updated Hold data.(Symbol : ${symbolData.id})`);
        }

        // 投資比率（セクター）の更新
        if (section && !isEqual(symbolData.section, section)) {
          await this.dbService.deleteSection(symbolData.id);
          await this.dbService.createSection(section);
          updated = true;
          this.logger.log(`Updated Section data.(Symbol : ${symbolData.id})`);
        }
        if (updated) {
          await this.dbService.updateSymbol(symbolData.id);
        } else {
          // 更新対象がない場合取得日のみ更新して、次のスケジュール日まで取得対象から外す
          await this.dbService.updateSymbolGetAt(symbolData.id);
          this.logger.log(`No update data.(Symbol : ${symbolData.id})`);
        }
      }
    } catch (error) {
      // 処理対象ページが取得できない場合
      this.logger.debug({ error: (error as Error).message });
      if (symbolData.retry < 3) {
        await this.dbService.updateSymbolRetryCount(symbolData.id, symbolData.retry + 1);
        this.logger.warn(`${symbolData.id} is Retry.@${symbolData.retry + 1}/3`);
      } else {
        await this.dbService.updateSymbolDeleted(symbolData.id);
        this.logger.warn(`${symbolData.id} is Delete.`);
      }
    }
  }
}
