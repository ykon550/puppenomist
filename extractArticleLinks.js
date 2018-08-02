const ppt = require('puppeteer');
require('dotenv').config();
const util = require('./util');

async function extractArticleLinks(page, issueLink){
    await util.randomSleep();
    await page.goto(issueLink, { timeout: 100000, waitUntil: 'networkidle2' });
    //get links of articles
    const articleLinks = await page.evaluate(() => {
        let _links = [];
        try {
            const main = document.querySelector('main');
            const as = main.querySelectorAll('a');
            for (const a of as) {
                const href = a.getAttribute('href');
                if (href.includes('/news/')) {
                    _links.push(a.getAttribute('href'))
                }
            }
        } catch (e) {
            console.log("error: " + e);
            console.log("skipped: " + document.URL);
        }
        return _links;
    })
    return articleLinks;
}

module.exports = extractArticleLinks;