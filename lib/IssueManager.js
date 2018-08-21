const fs = require('fs');
const util = require('./util');

const STATE = {
    LINK_EXTRACTED: "LINK_EXTRACTED",
    SCRAPE_STARTED: "SCRAPE_STARTED",
    DONE: "SCRAPE_DONE"
};

const MODE = {
    RESUME: "RESUME",
    FRESH: "FRESH"
};

/*
 * to filter URLs like following pattern
 * https://www.economist.com/printedition/covers?print_region=76980&date_filter%5Bvalue%5D%5Byear%5D=2016#
 */
const isIssuePattern = (link) => {
    const PATTERN = "https://www.economist.com/printedition/";
    const NOT_PATTERN = "https://www.economist.com/printedition/covers";
    if (link.startsWith(PATTERN) && !link.startsWith(NOT_PATTERN)) {
        return true;
    } else {
        return false;
    }
};

class IssueManager {
    static decideMode(isForce, year) {
        const _filePath = __dirname + '/../logs/issues_' + year + '.json';
        if (isForce) return MODE.FRESH;
        if (fs.existsSync(_filePath)) {
            return MODE.RESUME;
        } else {
            return MODE.FRESH;
        }
    }

    constructor(mode, year) {
        this.year = year;
        this.filePath = __dirname + '/../logs/issues_' + year + '.json';
        this.mode = mode;
        this._issueLinks = [];
        const getStatus = (mode) => {
            switch (mode) {
                case MODE.RESUME:
                    return JSON.parse(fs.readFileSync(this.filePath));
                case MODE.FRESH:
                    return { "year": this.year, "issues": [] };
                default:
                    throw new Error();
            }
        }
        this.status = getStatus(this.mode);
    }

    get issueLinks() {
        return this._issueLinks;
    }
    set issueLinks(links) {
        this._issueLinks = Array.from(links);
    }

    async selectTarget(page) {
        switch (this.mode) {
            case MODE.RESUME:
                this._issueLinks = this.status.issues
                    .filter((issue) => issue.state !== STATE.DONE)
                    .map((elem) => elem.url);
                break;
            case MODE.FRESH:
                await this.extractIssueLinks(page).catch((err) => {
                    console.log(err.message);
                    throw new Error(err.message)
                });
                this.initStatus();
                break;
        }
        console.log("target issues selected!")
    }


    async extractIssueLinks(page) {
        console.log("trying to extract issue links...");
        const buttonExp = '//a[contains(text(), "Current edition") and contains(@href, "/na/printedition") and contains(@class, "navigation__main-navigation-link")]';
        await util.clickLoad(page, buttonExp, 0)
            .then((httpCode) => {
                if (httpCode >= 400) throw new Error("unexpected http status: " + httpCode);
            });

        const issuesExp = '//a[@href="/printedition/covers"]';
        await util.clickLoad(page, issuesExp, 0)
            .then((httpCode) => {
                if (httpCode >= 400) throw new Error("unexpected http status: " + httpCode);
            });

        await util.sleep();
        await Promise.all([
            page.select('select#edit-date-filter-value-year', this.year),
            page.waitForNavigation({ timeout: 50000 })
        ]).catch((err) => {
            console.log(err.message + '97');
            throw new Error(err.message)
        });

        util.sleep(10000);
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

        // go home, jump from covers page seemes easily detected as robot behabior
        await page.goto('https://www.economist.com', { timeout: 100000, waitUntil: 'networkidle2' })
            .catch((err) => {
                console.log(err.message);
                throw new Error(err.message)
            });
    }

    initStatus() {
        const now = new Date().toISOString();
        this._issueLinks.map((link) => {
            let splits = link.split('/');
            const issueDate = splits.slice(-1).join();
            const elem = {
                "issueDate": issueDate,
                "url": link,
                "state": STATE.LINK_EXTRACTED,
                "lastEdited": now
            }
            this.status.issues.push(elem);
        })
        //TODO implement with no Sync for performance
        fs.writeFileSync(this.filePath, JSON.stringify(this.status));
        console.log("issues_" + this.year + ".json initialized!");
    }

    setState(url, _state) {
        const idx = util.getIndex(this.status.issues, "url", url);
        this.status.issues[idx].state = _state;
        fs.writeFileSync(this.filePath, JSON.stringify(this.status));
        console.log(_state + ': ' + url);
    }

    setStarted(url) {
        this.setState(url, STATE.SCRAPE_STARTED);
    }

    setDone(url) {
        this.setState(url, STATE.DONE);
    }
}

module.exports = IssueManager;