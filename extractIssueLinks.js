require('dotenv').config();
const util = require('./util');

const currentIssueLink = "https://www.economist.com/printedition/";

const isIssuePattern = (link) => {
    const PATTERN = "https://www.economist.com/printedition/";
    const NOT_PATTERN = "https://www.economist.com/printedition/covers/";
    if (link.startsWith(PATTERN) && !link.startsWith(NOT_PATTERN)) {
        return true;
    } else {
        return false;
    }
};

async function extractIssueLinks(page, targetYear = '2018'){
    console.log("trying to extract issue links...");
    await page.goto(currentIssueLink, { timeout: 100000, waitUntil: 'networkidle2' });
    const issuesButtons = await page.$x('//a[@href="/printedition/covers"]');

    await Promise.all([
        issuesButtons[1].click(),
        page.waitForNavigation({ timeout: 50000 })
    ]).catch((err) => console.log(err.message));

    await util.sleep();
    await Promise.all([
        page.select('select[name="date_filter[value][year]"]', targetYear),
        page.waitForNavigation({ timeout: 50000 })
    ]).catch((err) => console.log(err.message));

    let _links = [];
    const anchors = await page.$x('//div/a').catch((err) => console.log(err));
    for (const a of anchors) {
        let link = await page.evaluate(a => a.href, a).catch((err)=>console.log(err));
        if(isIssuePattern(link)){
            _links.push(link);
        }
    }

    const issueLinks = Array.from(new Set(_links));
    console.log("Issue links extracted!");
    return issueLinks;
};

module.exports = extractIssueLinks;