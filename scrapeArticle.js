const ppt = require('puppeteer');
require('dotenv').config();
const util = require('./util');

async function scrapeArticle(page, link) {
    let article = {
        title: '',
        text: [],
        url: '',
        date: '',
        section: '',
        filename: ''
    };
    await util.randomSleep();
    await page.goto('https://www.economist.com' + link, { timeout: 100000, waitUntil: 'networkidle2' });
    // expected URL example, https://www.economist.com/middle-east-and-africa/2018/07/26/zimbabwes-opposition-is-gaining-ground-ahead-of-upcoming-elections
    article.url = await page.url();
    article.title = article.url.split('/').slice(-4).join('_');
    article.section = article.url.split('/').slice(3, 4).join();
    article.date = article.url.split('/').slice(4, 7).join('');
    article.filename = article.title + '.json';

    article.text = await page.evaluate(() => {
        let _text = [];
        try {
            const articleElem = document.querySelector('article');
            const ps = articleElem.querySelectorAll('p');
            for (const p of ps) {
                _text.push(p.textContent);
            }
        } catch (e) {
            console.log(e);
            console.log("skipped:" + article.url);
        }
        return _text;
    });
    return article;
}

module.exports = scrapeArticle;