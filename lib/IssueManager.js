/**
 * 
 * mode fresh OR resume
 * 
 */

const fs = require('fs');
const util = require('./util');
const currentIssueLink = "https://www.economist.com/printedition/";

const STATUS = {
    LINK_EXTRACTED: "LINK_EXTRACTED",
    SCRAPE_STARTED: "SCRAPE_STARTED",
    DONE: "DONE"
};

const MODE = {
    RESUME: "RESUME",
    FRESH: "FRESH"
};

const getIndex = (arr, key, value) => {
    const isTarget = (elem, idx, arr) => {
        if (elem[key] === value) return true
    }
    return arr.findIndex(isTarget);
}

// TODO think again should stay here or move to index.js
const decideMode = (isFresh, filePath) => {
    if (isFresh) return MODE.FRESH;
    if (fs.existsSync(filePath)) {
        return MODE.RESUME;
    } else {
        return MODE.FRESH;
    }
}

const isIssuePattern = (link) => {
    const PATTERN = "https://www.economist.com/printedition/";
    const NOT_PATTERN = "https://www.economist.com/printedition/covers/";
    if (link.startsWith(PATTERN) && !link.startsWith(NOT_PATTERN)) {
        return true;
    } else {
        return false;
    }
};

class IssueManager {
    constructor(isFresh, year) {
        this.year = year;
        this.isFresh = isFresh;
        this.filePath = __dirname + '/../logs/issues_' + year + '.json';
        this.mode = decideMode(this.isFresh, this.filePath);
        this._issueLinks = [];
        const getStatus = (mode) => {
            switch(mode){
                case MODE.RESUME:
                    return JSON.parse(fs.readFileSync(this.filePath));
                case MODE.FRESH: 
                    return { "year": this.year, "issues": [] };
                default:   
                    throw new Error();
            }   
        }
        //TODO rethink about naming, this.status.issues[1].status <- not better way
        this.status = getStatus(this.mode);
    }

    get issueLinks() {
        return this._issueLinks;
    }
    set issueLinks(links) {
        this._issueLinks = Array.from(links);
    }

    async selectTarget(page) {
        switch(this.mode){
            case MODE.RESUME:
                this._issueLinks = this.status.issues
                                    .filter((issue) => issue.status !== STATUS.DONE)
                                    .map((elem) => elem.url);
                break;
            case MODE.FRESH:
                await this.extractIssueLinks(page);
                this.initStatus();
                break;
        }
        console.log("target issues selected!")
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
        console.log("suceeded to extract issue links!");
    }

    initStatus() {
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

    setStatus(url, _status){
        const idx = getIndex(this.status.issues, "url", url);
        this.status.issues[idx].status = _status;
        fs.writeFileSync(this.filePath, JSON.stringify(this.status));
        console.log(_status + url);
    }

    setStarted(url){
        this.setStatus(url, STATUS.SCRAPE_STARTED);
    }

    setDone(url){
        this.setStatus(url, STATUS.DONE);
    }
}

module.exports = IssueManager;