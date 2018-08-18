const CRAWL_DELAY = 5500;

const sleep = (msec = CRAWL_DELAY) => new Promise(resolve => setTimeout(resolve, msec));
const getIndex = (arr, key, value) => {
    const isTarget = (elem, idx, arr) => {
        if (elem[key] === value) return true
    }
    return arr.findIndex(isTarget);
}

module.exports.sleep = sleep;
module.exports.getIndex = getIndex;