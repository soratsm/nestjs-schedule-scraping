import { Test, TestingModule } from '@nestjs/testing';

import { ScheduleService } from '@/symbols/schedule/schedule.service';

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleService],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  xit('should be defined', () => {
    expect(service).toBeDefined();
  });
});
