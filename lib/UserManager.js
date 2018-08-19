const util = require('./util');
const prompt = require('prompt');
const colors = require('colors/safe');

class UserManager {
    constructor() {
        this.user = {}
        this._isLogined = false;
    }

    get isLogined(){
        return this._isLogined;
    }

    async askAccount() {
        const schema = {
            properties: {
                email: {
                    description: colors.green('Email'),
                    required: true
                },
                password: {
                    description: colors.green('Password'),
                    hidden: true,
                    replace: '*'
                }
            }
        };
        return new Promise((resolve, reject) => {
            prompt.get(schema, function (err, result) {
                if (err) reject(err);
                resolve(result);
            });
        }).then((result) => {
            this.user = result;
        });
    }

    async login(page) {
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
        await page.type('input[type="email"]', this.user.email);
        await util.sleep(300);
        await page.focus('input[type="password"]');
        await page.type('input[type="password"]', this.user.password);
        await util.sleep(300);
        const loginButton = await page.$("#submit-login");
        await util.sleep(300);
        // TODO how to check if succeeded to login
        // for now just decide it based on 5sec timeout
        await Promise.all([
            page.click("#submit-login"),
            page.waitForNavigation({ timeout: 5000 }),
            util.sleep()
        ]).catch((error) => {
            console.log(error.message);
            throw new Error("LOGIN FAILED");
        });
        this._isLogined = true;
        console.log("succeeded to login!");
    }
}

module.exports = UserManager;