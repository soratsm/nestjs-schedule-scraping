import { Injectable, Logger } from '@nestjs/common';
import { SymbolCountry, SymbolExplain, SymbolHold, SymbolSection } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import * as puppeteer from 'puppeteer';

import { closeFirstPage } from '@/utils/closeFirstPage';
import { createBrowser } from '@/utils/createBrowser';
import { wait } from '@/utils/wait';

type Explain = SymbolExplain | null;
type Country = SymbolCountry[] | null;
type Hold = SymbolHold[] | null;
type Section = SymbolSection[] | null;

type ScrapedResult = {
  explain: Explain;
  country: Country;
  hold: Hold;
  section: Section;
};

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  /**
   * スクレイピングを行い、対象ページがない場合はエラーキャッチして終了
   * @param _sourceSymbolId 取得対象の銘柄コード
   * @param _isFirstScraping 初回取得の銘柄コードか否か
   * @returns 対象銘柄の関連データ
   */
  async scrape(_sourceSymbolId: string, _isFirstScraping: boolean): Promise<ScrapedResult> {
    let browser: puppeteer.Browser;
    let scraped: ScrapedResult = null;

    try {
      browser = await createBrowser();
      scraped = await _scrapeSymbolData(browser, _sourceSymbolId, _isFirstScraping);
      this.logger.debug('Found Symbol page."');
    } catch (error) {
      this.logger.warn(error);
      // symbolに該当するページ存在しない
      this.logger.debug('Not Found Symbol page."');
    }

    await browser.close();
    return scraped;
  }
}

/**
 * スクレイピングロジック本体。XPathによって対象を取得しデータ構造に格納
 * @param browser ブラウザ情報を引き回して使用
 * @param symbolId 初回取得の銘柄コードか否か
 * @returns 対象銘柄の関連データ
 *
 * {@link https://qiita.com/go_sagawa/items/85f97deab7ccfdce53ea puppeteerでの要素の取得方法}
 *
 * {@link https://qiita.com/k1832/items/87a8cf609b4ccf2c6195 Puppeteerを使って簡単にWebスクレイピングする}
 *
 * {@link https://qiita.com/rh_taro/items/32bb6851303cbc613124 puppeteerでよく使うであろう処理の書き方}
 */
const _scrapeSymbolData = async (
  browser: puppeteer.Browser,
  symbolId: string,
  isFirstScraping: boolean,
): Promise<ScrapedResult> => {
  const url = process.env.EN_ETF_PREFIX_URL + symbolId;
  const page = await browser.newPage();

  await closeFirstPage(browser);

  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForXPath('/html/body/div[2]/div[7]/h1', {
    visible: true,
  });
  // 表示が完了する（であろう）ミリ秒数待つ
  await wait(1000);

  // ★★Hold★★
  const naRegexp = /N\/A/;
  let holdTmp: Record<never, never>[];
  const holdXpath = '//*[@id="etf-holdings"]/tbody/tr';
  const holdElems = await page.$x(holdXpath);
  for (let i = 1; i <= holdElems.length; i++) {
    // ■holdId
    const holdIdXpath = holdXpath + '[' + i + ']/td[1]';
    const holdIdElems = await page.$x(holdIdXpath);
    const holdIdJsHandle = await holdIdElems[0].getProperty('innerText');
    const holdIdJson: string = await holdIdJsHandle.jsonValue();
    const holdId = naRegexp.test(holdIdJson) ? '-' : holdIdJson;
    // ■holdName
    const holdNameXpath = holdXpath + '[' + i + ']/td[2]';
    const holdNameElems = await page.$x(holdNameXpath);
    const holdNameJsHandle = await holdNameElems[0].getProperty('innerText');
    const holdName = await holdNameJsHandle.jsonValue();
    // ■holdPer
    const holdPerXpath = holdXpath + '[' + i + ']/td[3]';
    const holdPerElems = await page.$x(holdPerXpath);
    const holdPerJsHandle = await holdPerElems[0].getProperty('innerText');
    const holdPerJson: string = await holdPerJsHandle.jsonValue();
    const holdPer = holdPerJson.replace(/%|' '/, '');
    // 一時配列に溜め込み
    holdTmp = {
      ...holdTmp,
      [`${holdName}@${holdId}`]: parseFloat(holdPer),
    };
  }

  const hold =
    holdTmp &&
    Object.entries(holdTmp).map(([key, value]) => ({
      id: symbolId,
      name: key.split(/@/)[0],
      per: value as unknown as Decimal,
      holdId: key.split(/@/)[1],
    }));

  // CountryとSectionは順番入れ替わりがあるので対象を広く取って一気に取得
  const perRegexp = /%/;
  let countryTmp: Record<never, never>[];
  let countryExists = false;
  const countryStartRegexp = /CountryBreakdown/;
  const countryEndRegexp =
    /RegionBreakdown|Holdings Analysis|SectorBreakdown|CapBreakdown|AssetAllocation/;
  let sectionTmp: Record<never, never>[];
  let sectionExists = false;
  const sectionStartRegexp = /SectorBreakdown/;
  const sectionEndRegexp =
    /RegionBreakdown|Holdings Analysis|CountryBreakdown|CapBreakdown|AssetAllocation/;

  const breakdownXpath = '//*[@id="charts_tab"]';
  const breakdownElems = await page.$x(breakdownXpath);
  const breakdownJsHandle = await breakdownElems[0].getProperty('innerText');
  const breakdownJson: string = await breakdownJsHandle.jsonValue();
  const breakdownSplit = breakdownJson.split(/\n/);
  for (let i = 0; i < breakdownSplit.length; i++) {
    if (!breakdownSplit[i].length) {
      // 値無しなら何もしない
      continue;
    }

    // ★★Country★★
    if (!countryExists && countryStartRegexp.test(breakdownSplit[i])) {
      for (let j = i + 1; j < breakdownSplit.length; j++) {
        if (countryEndRegexp.test(breakdownSplit[j])) {
          countryExists = true;
          i = j;
          break;
        } else if (
          breakdownSplit[j].length &&
          breakdownSplit[j + 1].length &&
          perRegexp.test(breakdownSplit[j + 1])
        ) {
          const countryName = breakdownSplit[j];
          const countryPer = breakdownSplit[j + 1].replace(/%|' '|\n/g, '') as unknown as Decimal;
          j++;
          if (countryPer.toString() === '0.0') {
            continue;
          } else {
            // 一時配列に溜め込み
            countryTmp = {
              ...countryTmp,
              [countryName]: countryPer,
            };
          }
        }
      }
    }

    // ★★Section★★
    if (!sectionExists && sectionStartRegexp.test(breakdownSplit[i])) {
      for (let j = i + 1; j < breakdownSplit.length; j++) {
        if (sectionEndRegexp.test(breakdownSplit[j])) {
          sectionExists = true;
          i = j;
          break;
        } else if (
          breakdownSplit[j].length &&
          breakdownSplit[j + 1].length &&
          perRegexp.test(breakdownSplit[j + 1])
        ) {
          const sectionName = breakdownSplit[j];
          const sectionPer = breakdownSplit[j + 1].replace(/%|' '|\n/g, '') as unknown as Decimal;
          j++;
          if (sectionPer.toString() === '0.0') {
            continue;
          } else {
            // 一時配列に溜め込み
            sectionTmp = {
              ...sectionTmp,
              [sectionName]: sectionPer,
            };
          }
        }
      }
    }

    // 両方読み込み完了ならループ終了
    if (countryExists && sectionExists) {
      break;
    }
  }

  const country =
    countryTmp &&
    Object.entries(countryTmp).map(([key, value]) => ({
      id: symbolId,
      name: key,
      per: value as unknown as Decimal,
    }));
  const section =
    sectionTmp &&
    Object.entries(sectionTmp).map(([key, value]) => ({
      id: symbolId,
      name: key,
      per: value as unknown as Decimal,
    }));

  // ★★Explain★★
  // ■expense_per
  const expense_perXpath = '//*[@id="overview"]/div[1]/div/div[1]/div[1]/div/div[4]/span[2]';
  const expense_perElems = await page.$x(expense_perXpath);
  const expense_perJsHandle = await expense_perElems[0].getProperty('innerText');
  const expense_perJson: string = await expense_perJsHandle.jsonValue();
  const expense_perReplace = expense_perJson.replace(/%|' '/, '') as unknown as Decimal;
  const expense_per =
    naRegexp.test(expense_perReplace.toString()) ||
    !isFinite(expense_perReplace as unknown as number)
      ? (0.0 as unknown as Decimal)
      : expense_perReplace;

  // ■yield_per
  const yield_perXpath = '//*[@id="dividend-table"]/div/div/div/table/tbody/tr[4]/td[2]';
  const yield_perElems = await page.$x(yield_perXpath);
  const yield_perJsHandle = await yield_perElems[0].getProperty('innerText');
  const yield_perJson: string = await yield_perJsHandle.jsonValue();
  const yield_perReplace = yield_perJson.replace(/%|' '|\n/g, '') as unknown as Decimal;
  const yield_per =
    naRegexp.test(yield_perReplace.toString()) || !isFinite(yield_perReplace as unknown as number)
      ? (0.0 as unknown as Decimal)
      : yield_perReplace;

  // 変化しない基本情報が未取得なら別ページに取得しに行く
  const explainStatic: Explain = isFirstScraping ? await _getExplainStatic(page, symbolId) : null;

  const explain: Explain = isFirstScraping
    ? {
        id: symbolId,
        name: explainStatic.name,
        summary: explainStatic.summary,
        comment: '',
        tags: explainStatic.tags,
        issuer: explainStatic.issuer,
        yield_per: yield_per,
        expense_per: expense_per,
        competing_etf: explainStatic.competing_etf,
      }
    : {
        id: symbolId,
        name: '',
        summary: '',
        comment: '',
        tags: '',
        issuer: '',
        yield_per: yield_per,
        expense_per: expense_per,
        competing_etf: '',
      };

  return {
    explain,
    country,
    hold,
    section,
  };
};

/**
 * 基本情報(運用会社等静的情報)の取得
 * @param page 投資情報のページ
 * @param symbolId 取得対象の銘柄コード
 * @returns 対象銘柄の基本情報
 */
const _getExplainStatic = async (page: puppeteer.Page, symbolId: string): Promise<Explain> => {
  let name: string;
  let summary: string;
  let tags: string;

  // ■name※日本語が取得できない場合に備え予め取得
  const nameXpath = '/html/body/div[2]/div[7]/h1/text()';
  const nameElems = await page.$x(nameXpath);
  const nameJsHandle = await nameElems[1].getProperty('textContent');
  const nameJson: string = await nameJsHandle.jsonValue();
  name = nameJson.replace(/\n/g, '');

  // ■issuer
  const issuerXpath = '//*[@id="overview"]/div[1]/div/div[1]/div[1]/div/div[1]/span[2]';
  const issuerElems = await page.$x(issuerXpath);
  const issuerJsHandle = await issuerElems[0].getProperty('innerText');
  const issuer: string = await issuerJsHandle.jsonValue();

  // ■competing_etf
  let competing_etfFirstCron = '';
  const breakdownXpath = '//*[@id="etf-ticker-profile_tab"]';
  const breakdownElems = await page.$x(breakdownXpath);
  const breakdownJsHandle = await breakdownElems[0].getProperty('innerText');
  const breakdownJson: string = await breakdownJsHandle.jsonValue();
  const breakdownLineSplit = breakdownJson.split(/\n/);
  for (let i = 1; i <= 4; i++) {
    const breakdownTabSplit = breakdownLineSplit[breakdownLineSplit.length - i].split(/\t/);
    const competing_etfTmp = breakdownTabSplit[1];
    const competing_etfRegExp = new RegExp(competing_etfTmp);
    if (!competing_etfRegExp.test(competing_etfFirstCron)) {
      competing_etfFirstCron = competing_etfFirstCron + ',' + competing_etfTmp;
    }
  }
  const competing_etf = competing_etfFirstCron.replace(/,/, '');

  // 別の静的ページから取得
  const NameSummaryUrl = process.env.EN_ETF_NAME_SUMMARY_URL;
  await page.goto(NameSummaryUrl, { waitUntil: 'networkidle2' });

  await page.waitForXPath('//*[@id="main"]/div[4]/div/h3', {
    visible: true,
  });

  // ■名称・連動指数・区分
  let exists = false;
  for (let i = 5; i <= 17; i = i + 2) {
    const listXpath = '//*[@id="main"]/div[' + i + ']/div/table/tbody[1]/tr';
    const listElems = await page.$x(listXpath);
    for (let j = 1; j <= listElems.length; j++) {
      const idXpath = listXpath + '[' + j + ']/th/div/p';
      const idElems = await page.$x(idXpath);
      let id = '';
      if (idElems.length) {
        const idJsHandle = await idElems[0].getProperty('innerText');
        id = await idJsHandle.jsonValue();
      }
      if (id.match(symbolId)) {
        // ■name※日本語が取得できたら上書き
        const nameXpath = listXpath + '[' + j + ']/td[1]/div/p';
        const nameElems = await page.$x(nameXpath);
        const nameJsHandle = await nameElems[0].getProperty('innerText');
        name = await nameJsHandle.jsonValue();

        // ■summary
        const summaryXpath = listXpath + '[' + j + ']/td[2]/div/p';
        const summaryElems = await page.$x(summaryXpath);
        const summaryJsHandle = await summaryElems[0].getProperty('innerText');
        summary = await summaryJsHandle.jsonValue();

        // ■tags
        switch (i) {
          case 5:
            tags = '全世界';
            break;
          case 7:
            tags = '先進国';
            break;
          case 9:
            tags = '新興国';
            break;
          case 11:
            tags = 'セクター';
            break;
          case 13:
            tags = '債券';
            break;
          case 15:
            tags = 'その他指数';
            break;
          case 17:
            tags = 'アクティブ';
            break;
        }
        exists = true;
        break;
      }
    }
    if (exists) {
      break;
    }
  }

  return {
    id: null,
    name: name ?? '',
    summary: summary ?? '',
    comment: null,
    tags: tags ?? '',
    issuer: issuer ?? '',
    yield_per: null,
    expense_per: null,
    competing_etf: competing_etf ?? '',
  };
};
