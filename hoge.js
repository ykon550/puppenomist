const ppt = require('puppeteer');
require('dotenv').config();
const CRAWL_DELAY = process.env.CRAWL_DELAY || 5500;
const randomSleep = (min = CRAWL_DELAY, max = 7000) => {
    const wait = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, wait))
};
const login = require('./login');
const issueLink = 'https://www.economist.com/printedition/2018-01-06';

console.log(typeof login);

(async () => {
    //const browser = await ppt.launch();
    const browser = await ppt.launch({ headless: false });
    const page = await browser.newPage();

    login(page);

    await randomSleep();
    page.goto(issueLink);
    // const articleLinks = await getArticleLinks(issueLink);
    // console.log('Issue page loaded');

    // // extract Articles
    // const numArticles = articleLinks.length;
    // for (const [idx, link] of articleLinks.entries()) {
    //     const article = await getArticle(link);
    //     const dir = './articles/' + article.date + '/';
    //     if (!fs.existsSync(dir)) {
    //         fs.mkdirSync(dir);
    //     }
    //     fs.writeFile(dir + article.filename, JSON.stringify(article, null, '\t'), (err) => {
    //         if (err) console.log("error: " + err);
    //         console.log('-->' + parseInt(parseInt(idx) + 1) + '/' + numArticles + ': ' + article.filename + " saved!");
    //     })
    // }
})();

