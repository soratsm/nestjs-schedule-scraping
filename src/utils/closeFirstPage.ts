import * as puppeteer from 'puppeteer';

/**
 * puppeteerで扱うブラウザ共通設定を保持して別ページに遷移する際に使用
 */
export const closeFirstPage = async (browser: puppeteer.Browser): Promise<void> => {
  const pages = await browser.pages();
  const firstPage = pages[0];
  await firstPage.close();
};
