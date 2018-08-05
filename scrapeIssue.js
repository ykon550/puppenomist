const ppt = require('puppeteer');
require('dotenv').config();
const util = require('./util');
const fs = require('fs');
const login = require('./login');
const extractArticleLinks = require('./extractArticleLinks');
const Scraper = require('./Scraper');

const issueLink = 'https://www.economist.com/printedition/2018-01-13';

const issueLinks = require('./ref/url2017_2.json');

(async () => {
    const browser = await ppt.launch();
    //const browser = await ppt.launch({ headless: false });
    let page = await browser.newPage();

    //disable loading images
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.resourceType() === 'image')
        request.abort();
      else
        request.continue();
    });

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36');
    await page.setViewport({ width: 1200, height: 1000 });
    await login(page);

    for (link of issueLinks){
        const articleLinks = await extractArticleLinks(page, link)
            .catch((err) => {
                console.log(err);
            });
        console.log("started " + link);

        const scraper = new Scraper(page, articleLinks);
        await scraper.scrape();
    }

    await browser.close();
})();