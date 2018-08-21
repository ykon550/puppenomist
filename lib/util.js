const CRAWL_DELAY = 5500;

const sleep = (msec = CRAWL_DELAY) => new Promise(resolve => setTimeout(resolve, msec));
const getIndex = (arr, key, value) => {
    const isTarget = (elem, idx, arr) => {
        if (elem[key] === value) return true
    }
    return arr.findIndex(isTarget);
}

const clickLoad = async (page, xPath, idx) => {
    const button = await page.$x(xPath).catch((err) => { throw new Error(err.message) });
    const responses = await Promise.all([
        page.waitForNavigation(),
        button[idx].click(),
        sleep()
    ]);
    return responses[0].status();
}

module.exports.sleep = sleep;
module.exports.getIndex = getIndex;
module.exports.clickLoad = clickLoad;