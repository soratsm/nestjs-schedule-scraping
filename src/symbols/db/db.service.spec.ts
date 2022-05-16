import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';

import { PrismaService } from '@/prisma.service';
import { DbService } from '@/symbols/db/db.service';
import { Decimal } from '@prisma/client/runtime';

describe('DbService', () => {
  let service: DbService;
  const timeout = 1000 * 40;
  const inputSymbolData = {
    id: 'dummy-id',
    type: 'dummy-type',
    retry: 0,
    deleted: false,
    update_at: '0000-01-01T00:00:00.456Z' as unknown as Date,
    get_at: '0000-01-01T00:00:00.456Z' as unknown as Date,
  };
  const inputSymbolExplainData = {
    id: 'dummy-id',
    name: 'dummy-name',
    summary: 'dummy-summary',
    comment: 'dummy-comment',
    tags: 'dummy-tag1,dummy-tag2',
    issuer: 'dummy-issuer',
    yield_per: 0.0 as unknown as Decimal,
    expense_per: 100.0 as unknown as Decimal,
    competing_etf: 'dummy-etf1,dummy-etf2',
  };
  const inputSymbolCountryData = [
    {
      id: 'dummy-id',
      name: 'dummy-country1',
      per: 60.0 as unknown as Decimal,
    },
    {
      id: 'dummy-id',
      name: 'dummy-country2',
      per: 40.0 as unknown as Decimal,
    },
  ];
  const inputSymbolHoldData = [
    {
      id: 'dummy-id',
      name: 'dummy-hold1',
      per: 60.0 as unknown as Decimal,
      holdId: 'dummy-holdId1',
    },
    {
      id: 'dummy-id',
      name: 'dummy-country2',
      per: 40.0 as unknown as Decimal,
      holdId: '',
    },
  ];
  const inputSymbolSectionData = [
    {
      id: 'dummy-id',
      name: 'dummy-section1',
      per: 60.0 as unknown as Decimal,
    },
    {
      id: 'dummy-id',
      name: 'dummy-section2',
      per: 40.0 as unknown as Decimal,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbService, PrismaService],
    }).compile();

    service = module.get<DbService>(DbService);
  });

  beforeAll(async () => {
    await deleteAllRelatedDataById(inputSymbolData.id);
  });

  afterAll(async () => {
    await deleteAllRelatedDataById(inputSymbolData.id);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create and Find data', () => {
    it(
      '[Create]DBの動作確認用に作ったテスト（確認が済んだら "xit" でテストが実行されないようにする）',
      async () => {
        const resultOfCreateSymbol = await service.createSymbol(inputSymbolData);
        console.log(`resultOfCreateSymbol : ${resultOfCreateSymbol}`);
        const resultOfCreateExplain = await service.createExplain(inputSymbolExplainData);
        console.log(`resultOfCreateExplain : ${resultOfCreateExplain}`);
        const resultOfCreateCountry = await service.createCountry(inputSymbolCountryData);
        console.log(`resultOfCreateCountry ${resultOfCreateCountry}`);
        const resultOfCreateHold = await service.createHold(inputSymbolHoldData);
        console.log(`resultOfCreateHold : ${resultOfCreateHold}`);
        const resultOfCreateSection = await service.createSection(inputSymbolSectionData);
        console.log(`resultOfCreateSection : ${resultOfCreateSection}`);
      },
      timeout,
    );

    it(
      '[Find]DBの動作確認用に作ったテスト（確認が済んだら "xit" でテストが実行されないようにする）',
      async () => {
        const resultOfFindone = await service.readScrapingSymbolData();
        console.log({ resultOfFindone });
        const resultOfGetAt = await service.updateSymbolGetAt(inputSymbolData.id);
        console.log(`resultOfGetAt : ${resultOfGetAt}`);
        const resultOfUpdateAt = await service.updateSymbol(inputSymbolData.id);
        console.log(`resultOfUpdateAt : ${resultOfUpdateAt}`);
      },
      timeout,
    );
  });
});

const deleteAllRelatedDataById = async (id: string) => {
  const prisma = new PrismaClient();
  const where = {
    id: id,
  };
  await prisma.$transaction([
    prisma.symbolExplain.deleteMany({ where }),
    prisma.symbolCountry.deleteMany({ where }),
    prisma.symbolHold.deleteMany({ where }),
    prisma.symbolSection.deleteMany({ where }),
    prisma.symbol.deleteMany({ where }),
  ]);
  await prisma.$disconnect();
};
