const program = require('commander');
const ppt = require('puppeteer');
require('dotenv').config();
const login = require('./lib/login');
const extractArticleLinks = require('./lib/extractArticleLinks');
const extractIssueLinks = require('./lib/extractIssueLinks');
const Scraper = require('./lib/Scraper');
let issueLinks = require('./ref/url2017_2.json');
const thisYear = new Date().getFullYear().toString();

program
    .usage('-y year')
    .option('-y, --year [value]', 'set target year to scrape, like 2018. Default value is This year', thisYear)
    .option('-v, --view', 'set this option when you want to see GUI')
    .parse(process.argv);

const targetYear = program.year;
const isHeadless = !program.view;

const puppenomist = async () => {
    const browser = await ppt.launch({ headless: isHeadless });
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
    issueLinks = await extractIssueLinks(page, targetYear);

    for (link of issueLinks) {
        const articleLinks = await extractArticleLinks(page, link)
            .catch((err) => {
                console.log(err);
            });
        console.log("started " + link);

        const scraper = new Scraper(page, articleLinks);
        await scraper.scrape();
    }

    await browser.close();
};

(async () => {
    await puppenomist();
})();

module.exports = puppenomist;