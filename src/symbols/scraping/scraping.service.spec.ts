import { Test, TestingModule } from '@nestjs/testing';

import { ScrapingService } from '@/symbols/scraping/scraping.service';

describe('ScrapingService', () => {
  let service: ScrapingService;
  const sourceId = 'VT';
  const isFirst = true;
  const timeout = 1000 * 40;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScrapingService],
    }).compile();

    service = module.get<ScrapingService>(ScrapingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  xit(
    'スクレイピングの動作確認用に作ったテスト（確認が済んだら "xit" でテストが実行されないようにする）',
    async () => {
      const result = await service.scrape(sourceId, isFirst);

      console.log({ result });
    },
    timeout,
  );
});
