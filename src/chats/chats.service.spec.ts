import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';

import { PrismaService } from '@/prisma.service';
import { ChatsService } from '@/chats/chats.service';

// データ投入の術を別途検討するよりテストプログラムで代用する
describe('ChatsService', () => {
  let service: ChatsService;
  const timeout = 1000 * 40;
  const inputData01 = {
    id: 'automation_tool',
    question: '自動化ツール開発についてですね。コチラからお問い合わせできます。',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: '問い合わせる',
          nextId: 'contact',
        },
        {
          order: 2,
          content: '最初の質問に戻る',
          nextId: 'init',
        },
      ],
    },
  };

  const inputData02 = {
    id: 'chatbot',
    question: 'xxx',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: '参考',
          nextId: 'https://www.youtube.com/playlist?list=PLX8Rsrpnn3IVOk48awq_nKW0aFP0MGpnn',
        },
        {
          order: 2,
          content: 'その他のポートフォリオについて知りたい',
          nextId: 'portfolio',
        },
        {
          order: 3,
          content: '最初の質問に戻る',
          nextId: 'init',
        },
      ],
    },
  };
  const inputData03 = {
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
      ],
    },
  };
  const inputData04 = {
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
  const inputData05 = {
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
          order: 2,
          content: '最初の質問に戻る',
          nextId: 'init',
        },
      ],
    },
  };
  const inputData06 = {
    id: 'other_portfolio',
    question: 'xxx',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: 'その他のポートフォリオについて知りたい',
          nextId: 'portfolio',
        },
        {
          order: 2,
          content: '最初の質問に戻る',
          nextId: 'init',
        },
      ],
    },
  };
  const inputData07 = {
    id: 'portfolio',
    question: 'react MUI ChakraUI',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: 'チャットボットについて知る',
          nextId: 'chatbot',
        },
        {
          order: 2,
          content: 'xxxについて知りたい',
          nextId: 'other_portfolio',
        },
        {
          order: 3,
          content: '最初の質問に戻る',
          nextId: 'init',
        },
      ],
    },
  };
  const inputData08 = {
    id: 'webapp',
    question: 'Webアプリ開発についてですね。コチラからお問い合わせできます。',
    deleted: false,
    answers: {
      create: [
        {
          order: 1,
          content: '問い合わせる',
          nextId: 'contact',
        },
        {
          order: 2,
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
        await service.createAllRelatedData(inputData01);
        await service.createAllRelatedData(inputData02);
        await service.createAllRelatedData(inputData03);
        await service.createAllRelatedData(inputData04);
        await service.createAllRelatedData(inputData05);
        await service.createAllRelatedData(inputData06);
        await service.createAllRelatedData(inputData07);
        await service.createAllRelatedData(inputData08);
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
