require('dotenv').config();
const util = require('./util');

async function login(page) {
    console.log("trying login...");
    await page.goto('https://www.economist.com', { timeout: 100000, waitUntil: 'networkidle2' });
    const baloonButton = await page.$x('//span[contains(text(), "Log in or sign up")]')
    await baloonButton[0].click();

    const gotoLogin = await page.$x('//button[@type="submit"]');
    await Promise.all([
        gotoLogin[0].click(),
        page.waitForNavigation(),
        util.sleep()
    ]);
    const email = await page.focus('input[type="email"]');
    await page.type('input[type="email"]', process.env.USER_EMAIL);
    await util.sleep(300);
    const password = await page.focus('input[type="password"]');
    await page.type('input[type="password"]', process.env.USER_PASSWORD);
    await util.sleep(300);
    const loginButton = await page.$("#submit-login");
    await util.sleep(300);
    await Promise.all([
        loginButton.click(),
        page.waitForNavigation(),
        util.sleep()
    ]);
    console.log("succeeded to login!");
    return page;
}
module.exports = login;  