const ppt = require('puppeteer');
require('dotenv').config();
const util = require('./util');
const fs = require('fs');
const login = require('./login');

const targetYear = '2017';
const coverLink = "https://www.economist.com/printedition/covers?print_region=76980&date_filter%5Bvalue%5D%5Byear%5D=" + targetYear;

const isIssuePattern = (link) => {
    const PATTERN = "https://www.economist.com/printedition/";
    const NOT_PATTERN = "https://www.economist.com/printedition/covers/";
    if (link.startsWith(PATTERN) && !link.startsWith(NOT_PATTERN)){
        return true;
    } else {
        return false;
    }
};

(async () => {
    //const browser = await ppt.launch();
    const browser = await ppt.launch({ headless: false });
    let page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36');
    await page.setViewport({ width: 1400, height: 1000 });
    await login(page);

    await page.goto(coverLink, { timeout: 100000, waitUntil: 'networkidle2' })

    let issueLinks = [];
    const anchors = await page.$x('//div/a').catch((err) => {
        console.log(err);
    });
    for (const a of anchors) {
        let link = await page.evaluate(a => a.href, a)
            .catch((err)=>{
                console.log(err);
            });
        if(isIssuePattern(link)){
            issueLinks.push(link);
        }
    }

    console.log(issueLinks);

    //await browser.close();
})();