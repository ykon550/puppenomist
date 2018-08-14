const CRAWL_DELAY = 5500;

const sleep = (msec = CRAWL_DELAY) => new Promise(resolve => setTimeout(resolve, msec));
module.exports.sleep = sleep;