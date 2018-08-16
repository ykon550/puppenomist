/**
 * 
 * mode fresh OR resume
 * 
 */

const fs = require('fs');
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

const STATUS = {
    LINK_EXTRACTED: "LINK_EXTRACTED",
    SCRAPE_STARTED: "SCRAPE_STARTED",
    DONE: "DONE"
}

class IssueManager {
    constructor(isFresh, year) {
        this.filePath = __dirname + '/../logs/issues_' + year + '.json';
        this.isFresh = isFresh;
        this.year = year;
        this._issueLinks = [];
        //TODO fs.readFileSync(filePath)
        this.status = {
            "year": year,
            "issues": []
        };
    }

    get issueLinks(){
        return this._issueLinks;
    }
    set issueLinks(links){
        this._issueLinks = Array.from(links);
    }

    async selectTarget(page) {
        if (this.isFresh) {
            await this.extractIssueLinks(page);
            this.initStatus();
        } else {
            // TODO
            //this.filter();
        }
    }

    // filter target issues based on the mode, from scratch or resume from last time
    filter() {
        if (this.isFresh) return;
        //TODO not yet implemented
        this._issueLinks = this._issueLinks.filter((elem) => { elem.status == "" });
    }

    async extractIssueLinks(page) {
        console.log("trying to extract issue links...");
        await page.goto(currentIssueLink, { timeout: 100000, waitUntil: 'networkidle2' });
        const issuesButtons = await page.$x('//a[@href="/printedition/covers"]');

        await Promise.all([
            issuesButtons[1].click(),
            page.waitForNavigation({ timeout: 50000 })
        ]).catch((err) => console.log(err.message));

        await util.sleep();
        await Promise.all([
            page.select('select[name="date_filter[value][year]"]', this.year),
            page.waitForNavigation({ timeout: 50000 })
        ]).catch((err) => console.log(err.message));

        let _links = [];
        const anchors = await page.$x('//div/a').catch((err) => console.log(err));
        for (const a of anchors) {
            let link = await page.evaluate(a => a.href, a).catch((err) => console.log(err));
            if (isIssuePattern(link)) {
                _links.push(link);
            }
        }

        this._issueLinks = Array.from(new Set(_links));
        console.log("Issue links extracted!");
    }

    initStatus(){
        const now = new Date().toISOString();
        this._issueLinks.map((link) => {
            let splits = link.split('/');
            const issueDate = splits.slice(-1).join();
            const elem = {
                "issueDate": issueDate,
                "url": link,
                "status": STATUS.LINK_EXTRACTED,
                "lastEdited": now
            }
            this.status.issues.push(elem);
        })
        //TODO implement with no Sync for performance
        fs.writeFileSync(this.filePath, JSON.stringify(this.status));
        console.log("issues_" + this.year + ".json initialized!");
    }

    scrapeStarted() {

    }
    scrapeDone() {

    }
}

module.exports = IssueManager;