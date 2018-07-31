const ppt = require('puppeteer');
require('dotenv').config();

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

(async () => {
    console.log('hoge');
    const browser = await ppt.launch({ headless: false });
    console.log('hoge');
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1000 });
    console.log('hoge');

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
        for(const a of as){
            const href = a.getAttribute('href');
            if(href.includes('/news/')){
                _links.push(a.getAttribute('href'))
            }
        }
        return _links;
    })
    console.log(links);

    // const nodes = await page.$x('//main//ul//a');
    // let links = [];
    // for( const node of nodes){
    //     links.push(node.getAttribute('href'));
    // }
    // console.log(links);

    // extract article
    await page.goto('https://www.economist.com/the-world-this-week/2018/07/26/politics-this-week', {waitUntil:'networkidle2'});
    const article = await page.evaluate(() => {
        const articleElem = document.querySelector('article');
        const ps = articleElem.querySelectorAll('p');
        let _text = [];
        for(const p of ps){
            _text.push(p.textContent);
        }
        return _text;
    })
    console.log(article);

    // const hoge = await page.$x('//article//p/text()');
    // console.log(hoge);




})();

