import { ChatsService } from '@/chats/chats.service';
import { PrismaService } from '@/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';

/**
 * データ投入の術を別途検討するよりテストプログラムで代用する
 */
describe('ChatsService', () => {
  let service: ChatsService;
  const timeout = 1000 * 40;
  const inputData000 = {
    id: 'init',
    question: 'こんにちは(^^) soratsmへのご用件はなんでしょうか？',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: '仕事を依頼したい',
          nextId: 'job_offer',
        },
        {
          order: 2,
          content: 'ポートフォリオについて知りたい',
          nextId: 'portfolio',
        },
        {
          order: 3,
          content: 'コンタクトを取りたい',
          nextId: 'dating',
        },
      ],
    },
  };
  const inputData100 = {
    id: 'job_offer',
    question: 'どのようなお仕事でしょうか？',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: 'Webアプリを開発してほしい',
          nextId: 'webapp',
        },
        {
          order: 2,
          content: '自動化ツールを作ってほしい',
          nextId: 'automation_tool',
        },
        {
          order: 3,
          content: 'その他',
          nextId: 'other_jobs',
        },
      ],
    },
  };
  const inputData110 = {
    id: 'webapp',
    question:
      'Webアプリ開発についてですね。Reactによる当サイトのようなWebアプリなどが可能です。詳細はコチラからお問い合わせできます。',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: '問い合わせる',
          nextId: 'contact',
        },
        {
          order: 9,
          content: '最初の質問に戻る',
          nextId: 'init',
        },
      ],
    },
  };
  const inputData120 = {
    id: 'automation_tool',
    question:
      '自動化ツール開発についてですね。VBA|GAS|API|スクレイピングなどが可能です。詳細はコチラからお問い合わせできます。',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: '問い合わせる',
          nextId: 'contact',
        },
        {
          order: 9,
          content: '最初の質問に戻る',
          nextId: 'init',
        },
      ],
    },
  };
  const inputData130 = {
    id: 'other_jobs',
    question: 'その他についてですね。コチラからお問い合わせできます。',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: '問い合わせる',
          nextId: 'contact',
        },
        {
          order: 9,
          content: '最初の質問に戻る',
          nextId: 'init',
        },
      ],
    },
  };
  const inputData200 = {
    id: 'portfolio',
    question:
      'キーワード『React/TypeScript/MUI/ChakraUI/Express/Firebase/Supabase』あたりで作成しています。詳しくはinfoページまで',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: 'ETF一覧について知りたい',
          nextId: 'etfs',
        },
        {
          order: 2,
          content: 'チャットボットについて知りたい',
          nextId: 'chatbot',
        },
        {
          order: 9,
          content: '最初の質問に戻る',
          nextId: 'init',
        },
      ],
    },
  };
  const inputData210 = {
    id: 'etfs',
    question:
      'ETF一覧及び各ETFのページは静的なサイトを提供しているため、非常に高速に情報を確認できます。',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: '参考にさせて頂いたモノ',
          nextId: 'https://nextjs.org/docs/basic-features/pages',
        },
        {
          order: 2,
          content: 'その他のポートフォリオについて知りたい',
          nextId: 'portfolio',
        },
        {
          order: 9,
          content: '最初の質問に戻る',
          nextId: 'init',
        },
      ],
    },
  };
  const inputData220 = {
    id: 'chatbot',
    question:
      'チャットボットは下記を参考に『Next.js|Supabase|Chakra UI|関数Component』と色々置き換えつつ、今見ているボットさんが語りかけています。',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: '参考にさせて頂いたモノ',
          nextId: 'https://www.youtube.com/playlist?list=PLX8Rsrpnn3IVOk48awq_nKW0aFP0MGpnn',
        },
        {
          order: 2,
          content: 'その他のポートフォリオについて知りたい',
          nextId: 'portfolio',
        },
        {
          order: 9,
          content: '最初の質問に戻る',
          nextId: 'init',
        },
      ],
    },
  };
  const inputData300 = {
    id: 'dating',
    question: 'まずは一緒にランチでもいかがですか？DMしてください。',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: 'DMする',
          nextId: 'https://twitter.com/soratsm',
        },
        {
          order: 9,
          content: '最初の質問に戻る',
          nextId: 'init',
        },
      ],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatsService, PrismaService],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
  });

  beforeAll(async () => {
    await deleteAllRelatedData();
  });

  afterAll(async () => {
    // await deleteAllRelatedData();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create and Find data', () => {
    it(
      '[Create]DBの動作確認用に作ったテスト（確認が済んだら "xit" でテストが実行されないようにする）',
      async () => {
        await service.createAllRelatedData(inputData000);
        await service.createAllRelatedData(inputData100);
        await service.createAllRelatedData(inputData110);
        await service.createAllRelatedData(inputData120);
        await service.createAllRelatedData(inputData130);
        await service.createAllRelatedData(inputData200);
        await service.createAllRelatedData(inputData210);
        await service.createAllRelatedData(inputData220);
        await service.createAllRelatedData(inputData300);
      },
      timeout,
    );

    it(
      '[Find]DBの動作確認用に作ったテスト（確認が済んだら "xit" でテストが実行されないようにする）',
      async () => {
        const resultOfFindone = await service.findAll();

        console.log({ resultOfFindone });
      },
      timeout,
    );
  });
});

const deleteAllRelatedData = async () => {
  const prisma = new PrismaClient();
  await prisma.$transaction([prisma.answers.deleteMany(), prisma.questions.deleteMany()]);
  await prisma.$disconnect();
};
