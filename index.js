const program = require('commander');
const ppt = require('puppeteer');
const login = require('./lib/login');
const extractArticleLinks = require('./lib/extractArticleLinks');
const Scraper = require('./lib/Scraper');
const IssueManager = require('./lib/IssueManager');
const askAccount = require('./lib/askAccount');
const thisYear = new Date().getFullYear().toString();

program
    .usage('-y year')
    .option('-y, --year [value]', 'set target year to scrape, like 2018. Default value is This year', thisYear)
    .option('-v, --view', 'set this option when you want to see GUI')
    .option('-f, --force', 'force start from scracth')
    .parse(process.argv);

const targetYear = program.year || thisYear;
const isHeadless = !program.view;
// scrape mode, scrape from scratch or resume from last time
const isForce = program.force?  true: false;

const puppenomist = async () => {
    const user = await askAccount();

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
    await page.setViewport({ width: 1200, height: 1000 });

    const loginResult = await login(page, user).catch((error) => {
        console.log(error.message);
        return {isLogined:false};
    });
    if(!loginResult.isLogined){
        console.log("terminating...");
        await browser.close();
        process.exit(1);
    }

    const scrapeMode = IssueManager.decideMode(isForce, targetYear);
    const issueMgr = new IssueManager(scrapeMode, targetYear);
    await issueMgr.selectTarget(page);

    for (link of issueMgr.issueLinks) {
        issueMgr.setStarted(link);
        const articleLinks = await extractArticleLinks(page, link)
            .catch((err) => {
                console.log(err);
            });
        const scraper = new Scraper(page, articleLinks);
        await scraper.scrape();
        issueMgr.setDone(link);
    }

    await browser.close();
};

(async () => {
    await puppenomist();
})();

module.exports = puppenomist;