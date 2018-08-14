const util = require('./util');

async function login(page, user) {
    let result = { isLogined: false }

    console.log("trying to login...");
    await page.goto('https://www.economist.com', { timeout: 100000, waitUntil: 'networkidle2' });
    const baloonButton = await page.$x('//span[contains(text(), "Log in or sign up")]')
    await baloonButton[0].click();

    const gotoLogin = await page.$x('//button[@type="submit"]');
    await Promise.all([
        gotoLogin[0].click(),
        page.waitForNavigation(),
        util.sleep()
    ]);
    await page.focus('input[type="email"]');
    await page.type('input[type="email"]', user.email);
    await util.sleep(300);
    await page.focus('input[type="password"]');
    await page.type('input[type="password"]', user.password);
    await util.sleep(300);
    const loginButton = await page.$("#submit-login");
    await util.sleep(300);
    await Promise.all([
        page.click("#submit-login"),
        page.waitForNavigation({ timeout: 5000 }),
        util.sleep()
    ]).catch((error) => {
        throw new Error("LOGIN FAILED");
    });
    //TODO how to check if succeeded to login
    result.isLogined = true;
    console.log("succeeded to login!");
    return result;
}
module.exports = login;  