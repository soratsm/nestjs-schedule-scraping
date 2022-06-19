import * as puppeteer from 'puppeteer';

/**
 * puppeteerで扱うブラウザの生成＆共通設定
 *
 * {@link https://pptr.dev/#?product=Puppeteer&version=main&show=api-class-puppeteer Puppeteer API Documents}
 *
 * {@link https://dev.to/ziv/running-puppeteer-on-heroku-free-tier-e7b Puppeteer をHerokuで動かすための参考記事}
 */
export const createBrowser = async (): Promise<puppeteer.Browser> => {
  // const windowSize = {
  //   width: 800,
  //   height: 600,
  // };
  const browser = await puppeteer.launch({
    headless: true,
    // defaultViewport: {
    //   width: windowSize.width,
    //   height: windowSize.height,
    // },

    args: [
      // `--window-size=${windowSize.width},${windowSize.height}`,
      // '-wait-for-browser',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  return browser;
};
