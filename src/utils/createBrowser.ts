import * as puppeteer from 'puppeteer';

export const createBrowser = async (): Promise<puppeteer.Browser> => {
  // const windowSize = {
  //   width: 800,
  //   height: 600,
  // };
  // https://pptr.dev/#?product=Puppeteer&show=api-puppeteerlaunchoptions
  const browser = await puppeteer.launch({
    headless: true,
    // defaultViewport: {
    //   width: windowSize.width,
    //   height: windowSize.height,
    // },

    // https://dev.to/ziv/running-puppeteer-on-heroku-free-tier-e7b
    // https://peter.sh/experiments/chromium-command-line-switches/
    args: [
      // `--window-size=${windowSize.width},${windowSize.height}`,
      '--disable-infobars',
      // '-wait-for-browser',
      '--incognito',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--lang=ja',
    ],
  });

  return browser;
};
