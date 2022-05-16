import { Test, TestingModule } from '@nestjs/testing';

import { DomainService } from '@/symbols/domain/domain.service';

describe('DomainService', () => {
  let service: DomainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DomainService],
    }).compile();

    service = module.get<DomainService>(DomainService);
  });

  xit('should be defined', () => {
    expect(service).toBeDefined();
  });
});
