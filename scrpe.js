const ppt = require('puppeteer');
require('dotenv').config();
const CRAWL_DELAY = process.env.CRAWL_DELAY || 5500;
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
const randomSleep = (min = CRAWL_DELAY, max = 7000) => {
    const wait = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, wait))
};

const fs = require('fs');

(async () => {
    async function getArticleLinks(issueLink){
        await randomSleep();
        await page.goto(issueLink, { timeout: 100000, waitUntil: 'networkidle2' });
        //get links of articles
        const articleLinks = await page.evaluate(() => {
            let _links = [];
            try {
                const main = document.querySelector('main');
                const as = main.querySelectorAll('a');
                for (const a of as) {
                    const href = a.getAttribute('href');
                    if (href.includes('/news/')) {
                        _links.push(a.getAttribute('href'))
                    }
                }
            } catch (e) {
                console.log("error: " + e);
                console.log("skipped: " + document.URL);
            }
            return _links;
        })
        return articleLinks;
    }
    async function getArticle(link){
        let article = {
            title: '',
            text: [],
            url: '',
            date: '',
            section: '',
            filename: ''
        };
        await randomSleep();
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

    //const browser = await ppt.launch();
    const browser = await ppt.launch({ headless: false });
    const page = await browser.newPage();

    login(page);

    await randomSleep();
    await page.goto('https://www.economist.com/printedition/2018-01-06', { timeout: 100000, waitUntil: 'networkidle2' });

    await randomSleep();
    await page.goto('https://www.economist.com/printedition/covers', { timeout: 100000, waitUntil: 'networkidle2' });
    await randomSleep();
    await page.goto('https://www.economist.com/printedition/covers?print_region=76980&date_filter%5Bvalue%5D%5Byear%5D=2017', { timeout: 100000, waitUntil: 'networkidle2' });

    console.log('yearly page loaded');

    //get links of articles
    let issueLinks = [];
    try {
        const anchors = await page.$x('//div[@id="column-content"]//div[contains(@class, "print-cover-image")]//a');
        for (const a of anchors) {
            let link = await page.evaluate(a => a.href, a);
            issueLinks.push(link);
        }
    } catch (e) {
        console.log("error: " + e);
    }

    // extract Issues
    const numIssues = issueLinks.length;
    for (const [index, issueLink] of issueLinks.entries()) {
        console.log(parseInt(parseInt(index) + 1) + '/' + numIssues + ' Issues: ');
        const articleLinks = await getArticleLinks(issueLink);

        // extract Articles
        const numArticles = articleLinks.length;
        for (const [idx, link] of articleLinks.entries()) {
            const article = await getArticle(link);
            const dir = './articles/' + article.date + '/';
            if(!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            fs.writeFile(dir + article.filename, JSON.stringify(article, null, '\t'), (err) => {
                if (err) console.log("error: " + err);
                console.log('-->' + parseInt(parseInt(idx) + 1) + '/' + numArticles + ': ' + article.filename + " saved!");
            })
        }
    }
})();

