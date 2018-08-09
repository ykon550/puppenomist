require('dotenv').config();
const util = require('./util');
const ARTICLE_URL_START = "https://www.economist.com/news/";

//TODO
//before 2014, the url starts with /nodes/ . not /news/

async function extractArticleLinks(page, issueLink){
    await util.randomSleep();
    await page.goto(issueLink, { timeout: 100000, waitUntil: 'networkidle2' });

    let articleLinks = [];
    try {
        const anchors = await page.$x('//main//a')
            .catch((err) => {
                console.log(err);
            });
        for (const a of anchors) {
            let link = await page.evaluate(a => a.href, a);
            if(link.startsWith(ARTICLE_URL_START)){
                articleLinks.push(link);
            }
        }
    } catch (e) {
        console.log("error: " + e);
    }
    return articleLinks;
}

module.exports = extractArticleLinks;