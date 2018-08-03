require('dotenv').config();
const CRAWL_DELAY = process.env.CRAWL_DELAY || 5500;

const sleep = (msec = CRAWL_DELAY) => new Promise(resolve => setTimeout(resolve, msec));
const randomSleep = (min = CRAWL_DELAY, max = 7000) => {
    min = parseInt(min);
    max = parseInt(max);
    const wait = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, wait))
};

module.exports.sleep = sleep;
module.exports.randomSleep = randomSleep;