/**
 * 
 * mode fresh OR resume
 * 
 */

const filePath = __dirname + '/../log.json';
const fs = require('fs');

const STATUS = {
    LINK_EXTRACTED: "LINK_EXTRACTED",
    SCRAPE_STARTED: "SCRAPE_STARTED",
    DONE: "DONE"
}

const getIndex = (arr, key, value) => {
    const isTarget = (elem, idx, arr) => {
        if (elem[key] === value) return true
    }
    return arr.findIndex(isTarget);
}

class Logger {
    constructor(mode) {
        this.mode = mode;
        //TODO fs.readFileSync(filePath)
        this.log = [
            {
                "year":2018,
                "issues":[]
            }
        ];
    }
    issueLinksExtracted(year, links) {
        const now = new Date().toISOString();
        const idx = getIndex(this.log, "year", year);

        links.map((link) => {
            let splits = link.split('/');
            const issueDate = splits.slice(-1).join();
            const elem = {
                "issueDate": issueDate,
                "url": link,
                "status": STATUS.LINK_EXTRACTED,
                "lastEdited": now
            }
            this.log[idx].issues.push(elem);
        })
        //TODO implement with no Sync for performance
        fs.writeFileSync(filePath, JSON.stringify(this.log));
    }
    scrapeStarted() {

    }
    scrapeDone() {

    }
}

module.exports = Logger;