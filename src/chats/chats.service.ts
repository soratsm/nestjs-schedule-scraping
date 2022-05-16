import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.questions.findMany({
      include: {
        answers: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async createAllRelatedData(data: Prisma.QuestionsCreateInput) {
    return this.prisma.questions.create({
      data,
    });
  }
}
