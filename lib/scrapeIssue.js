const ppt = require('puppeteer');
require('dotenv').config();
const login = require('./login');
const extractArticleLinks = require('./extractArticleLinks');
const extractIssueLinks = require('./extractIssueLinks');
const Scraper = require('./Scraper');

let issueLinks = require('./ref/url2017_2.json');

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
    issueLinks = await extractIssueLinks(page, '2018');

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