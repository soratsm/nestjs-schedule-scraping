import { Injectable } from '@nestjs/common';
import { Symbol, SymbolCountry, SymbolExplain, SymbolHold, SymbolSection } from '@prisma/client';

import { PrismaService } from '@/prisma.service';

@Injectable()
export class DbService {
  constructor(private prisma: PrismaService) {}

  async readScrapingSymbolData() {
    const dt = new Date();
    dt.setDate(dt.getDate() - 10);
    return this.prisma.symbol.findFirst({
      include: {
        explain: true,
        country: {
          orderBy: {
            per: 'desc',
          },
        },
        hold: {
          orderBy: {
            per: 'desc',
          },
        },
        section: {
          orderBy: {
            per: 'desc',
          },
        },
      },
      where: {
        deleted: false,
        get_at: { lte: dt },
      },
      orderBy: {
        get_at: 'asc',
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  async createSymbol(data: Symbol) {
    return this.prisma.symbol.create({
      data,
    });
  }

  // 取得可能ページでもタイムアウト可能性あるため猶予措置
  async updateSymbolRetryCount(id: string, count: number) {
    return this.prisma.symbol.update({
      where: { id },
      data: {
        retry: count,
        // get_at: new Date(),
      },
    });
  }
  // retry3カウントした場合、論理削除
  async updateSymbolDeleted(id: string) {
    return this.prisma.symbol.update({
      where: { id },
      data: {
        deleted: true,
        update_at: new Date(),
        get_at: new Date(),
      },
    });
  }

  // 何かしら更新が発生した場合
  async updateSymbol(id: string) {
    return this.prisma.symbol.update({
      where: { id },
      data: {
        retry: 0,
        update_at: new Date(),
        get_at: new Date(),
      },
    });
  }

  // 更新項目がなかった場合
  async updateSymbolGetAt(id: string) {
    return this.prisma.symbol.update({
      where: { id },
      data: {
        retry: 0,
        get_at: new Date(),
      },
    });
  }

  async createExplain(data: SymbolExplain) {
    return this.prisma.symbolExplain.create({
      data,
    });
  }
  async updateExplain(id: string, data: SymbolExplain) {
    return this.prisma.symbolExplain.update({
      where: { id },
      data: {
        expense_per: data.expense_per,
        yield_per: data.yield_per,
      },
    });
  }
  // 更新の場合全削除→登録による洗い替え
  async deleteCountry(id: string) {
    return this.prisma.symbolCountry.deleteMany({
      where: { id },
    });
  }
  async createCountry(data: SymbolCountry[]) {
    return this.prisma.symbolCountry.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async deleteHold(id: string) {
    return this.prisma.symbolHold.deleteMany({
      where: { id },
    });
  }
  async createHold(data: SymbolHold[]) {
    return this.prisma.symbolHold.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async deleteSection(id: string) {
    return this.prisma.symbolSection.deleteMany({
      where: { id },
    });
  }
  async createSection(data: SymbolSection[]) {
    return this.prisma.symbolSection.createMany({
      data,
      skipDuplicates: true,
    });
  }
}
