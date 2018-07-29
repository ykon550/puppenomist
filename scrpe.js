const ppt = require('puppeteer');
require('dotenv').config();

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

(async () => {
    console.log('hoge');
    const browser = await ppt.launch({headless: false});
    console.log('hoge');
    const page = await browser.newPage();
    console.log('hoge');

    //Login
    await page.goto('https://www.economist.com', {waitUntil: 'networkidle2'});
    const baloonButton = await page.$x('//span[contains(text(), "Log in or sign up")]')
    await baloonButton[0].click();
    const gotoLogin = await page.$x('//button[@type="submit"]');
    await gotoLogin[0].click();
    await sleep(2000);
    const email = await page.focus('input[type="email"]');
    await page.type('input[type="email"]', process.env.USER_EMAIL);
    await sleep(1000);
    const password = await page.focus('input[type="password"]');
    await page.type('input[type="password"]', process.env.USER_PASSWORD);
    await sleep(1000);
    const loginButton = await page.$("#submit-login");
    await sleep(1000);
    await loginButton.click();


    await page.goto('https://www.economist.com/na/printedition/', {waitUntil: 'networkidle2'});

})();

