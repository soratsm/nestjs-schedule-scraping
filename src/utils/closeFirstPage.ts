import * as puppeteer from 'puppeteer';

export const closeFirstPage = async (browser: puppeteer.Browser): Promise<void> => {
  const pages = await browser.pages();
  const firstPage = pages[0];
  await firstPage.close();
};
