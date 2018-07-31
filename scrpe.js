const ppt = require('puppeteer');
require('dotenv').config();
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
const CRAWL_DELAY=5000;
const fs = require('fs');

(async () => {
    const browser = await ppt.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1000 });

    //Login
    await page.goto('https://www.economist.com', { waitUntil: 'networkidle2' });
    const baloonButton = await page.$x('//span[contains(text(), "Log in or sign up")]')
    await baloonButton[0].click();
    const gotoLogin = await page.$x('//button[@type="submit"]');
    await gotoLogin[0].click();
    await sleep(3000);
    const email = await page.focus('input[type="email"]');
    await page.type('input[type="email"]', process.env.USER_EMAIL);
    await sleep(300);
    const password = await page.focus('input[type="password"]');
    await page.type('input[type="password"]', process.env.USER_PASSWORD);
    await sleep(300);
    const loginButton = await page.$("#submit-login");
    await sleep(300);
    await loginButton.click();

    await sleep(3000);
    await page.goto('https://www.economist.com/na/printedition/', { waitUntil: 'networkidle2' });

    //get links of articles
    const links = await page.evaluate(() => {
        const main = document.querySelector('main');
        const as = main.querySelectorAll('a');
        let _links = [];
        for (const a of as) {
            const href = a.getAttribute('href');
            if (href.includes('/news/')) {
                _links.push(a.getAttribute('href'))
            }
        }
        return _links;
    })
    //console.log(links);

    // extract article
    const numArticles = links.length;
    for (const [idx, link] of links.entries()) {
        await sleep(CRAWL_DELAY);
        let article = {
            title: '',
            text: [],
            url: '',
            date: '',
            section: '',
            filename: ''
        };

        await page.goto('https://www.economist.com' + link, { waitUntil: 'networkidle2' });
        // expected URL example, https://www.economist.com/middle-east-and-africa/2018/07/26/zimbabwes-opposition-is-gaining-ground-ahead-of-upcoming-elections
        article.url = await page.url();
        article.title = article.url.split('/').slice(-4).join('_');
        article.section = article.url.split('/').slice(3,4).join();
        article.date = article.url.split('/').slice(4,7).join('');
        article.filename = article.title + '.json';

        article.text = await page.evaluate(() => {
            const articleElem = document.querySelector('article');
            const ps = articleElem.querySelectorAll('p');
            let _text = [];
            for (const p of ps) {
                _text.push(p.textContent);
            }
            return _text;
        })
        fs.writeFile('./articles/' + article.filename, JSON.stringify(article, null, '\t'), (err) => {
            if(err) console.log("error: " + err);
            console.log(idx+1 + '/' + numArticles + ': ' + article.filename + " saved!");
        })
    }
})();

