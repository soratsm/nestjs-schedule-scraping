import { Injectable } from '@nestjs/common';
import { Symbol, SymbolCountry, SymbolExplain, SymbolHold, SymbolSection } from '@prisma/client';

import { PrismaService } from '@/prisma.service';

@Injectable()
export class DbService {
  constructor(private prisma: PrismaService) {}

  /**
   * 前回取得日から10日経過している情報を単一取得
   */
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

  /**
   * @deprecated
   * 対象データの投入。基本的にSupabaseのダッシュボードから投入するため使用しない
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  async createSymbol(data: Symbol) {
    return this.prisma.symbol.create({
      data,
    });
  }

  /**
   * retryのカウントアップし、取得日を更新
   * (取得可能ページでもタイムアウト可能性あるため猶予措置)
   * @param id 銘柄コード
   * @param count 更新値(DB値+1を渡す)
   */
  async updateSymbolRetryCount(id: string, count: number) {
    return this.prisma.symbol.update({
      where: { id },
      data: {
        retry: count,
        get_at: new Date(),
      },
    });
  }

  /**
   * retry3カウントした場合、論理削除
   * (Supabaseのダッシュボードから論理削除フラグを下ろす必要あり)
   * @param id 銘柄コード
   */
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

  /**
   * 何かしら更新が発生した場合、取得日と更新日更新
   * @param id 銘柄コード
   */
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

  /**
   * 更新項目がなかった場合、取得日のみ更新
   * @param id 銘柄コード
   */
  async updateSymbolGetAt(id: string) {
    return this.prisma.symbol.update({
      where: { id },
      data: {
        retry: 0,
        get_at: new Date(),
      },
    });
  }

  /**
   * 銘柄基本情報の作成
   * @param data 基本情報
   */
  async createExplain(data: SymbolExplain) {
    return this.prisma.symbolExplain.create({
      data,
    });
  }

  /**
   * 銘柄基本情報の更新
   * @param id 銘柄コード(更新対象)
   * @param data 基本情報
   */
  async updateExplain(id: string, data: SymbolExplain) {
    return this.prisma.symbolExplain.update({
      where: { id },
      data: {
        expense_per: data.expense_per,
        yield_per: data.yield_per,
      },
    });
  }

  /**
   * 国別投資情報の削除(更新の場合全削除→登録による洗い替え)
   * @param id 銘柄コード(削除対象)
   */
  async deleteCountry(id: string) {
    return this.prisma.symbolCountry.deleteMany({
      where: { id },
    });
  }

  /**
   * 国別投資情報の作成(更新の場合全削除→登録による洗い替え)
   * @param data 国別投資情報
   */
  async createCountry(data: SymbolCountry[]) {
    return this.prisma.symbolCountry.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * 保有銘柄別投資情報の削除(更新の場合全削除→登録による洗い替え)
   * @param id 銘柄コード(削除対象)
   */
  async deleteHold(id: string) {
    return this.prisma.symbolHold.deleteMany({
      where: { id },
    });
  }

  /**
   * 保有銘柄別投資情報の作成(更新の場合全削除→登録による洗い替え)
   * @param data 保有銘柄別投資情報
   */
  async createHold(data: SymbolHold[]) {
    return this.prisma.symbolHold.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * セクション別投資情報の削除(更新の場合全削除→登録による洗い替え)
   * @param id 銘柄コード(削除対象)
   */
  async deleteSection(id: string) {
    return this.prisma.symbolSection.deleteMany({
      where: { id },
    });
  }

  /**
   * セクション別投資情報の作成(更新の場合全削除→登録による洗い替え)
   * @param data セクション別投資情報
   */
  async createSection(data: SymbolSection[]) {
    return this.prisma.symbolSection.createMany({
      data,
      skipDuplicates: true,
    });
  }
}
