const ppt = require('puppeteer');

(async () => {
    console.log('hoge');
    const browser = await ppt.launch({headless: false});
    console.log('hoge');
    const page = await browser.newPage();
    console.log('hoge');
    await page.goto('https://www.economist.com', {waitUntil: 'networkidle2'});

    /** 
    var data = await page.$$eval('span', items => {
        return items.map((item) => item.textContent);
//        return items.filter((item) => item.textContent == "Log in or sign up");
    });
    data.map((data) => console.log(data));
    */

    /** 
    var data = await page.$$eval('a', elems => {
        return elems.filter((elem) => {
            if(elem.href){
                return elem.href.includes('authenticate')
            } else {
                return false
            }
        });
    });
    console.log(data);
    */

    var data = await page.$$eval('a', elems => {
        return elems.map((elem) => elem.href);
    });
    let but = data.filter((item) => {
            return item && item.includes('authenticate')
        })
    console.log(but[0]);
    await page.goto(but[0], {waitUntil: 'networkidle2'});

    //const loginBaloon = await page.$('a[target="_blank"]');
    //console.log(loginBaloon);
    //await loginBaloon.click();
    //const loginEl = await page.$('button[type="submit"]');
    //await loginEl.click();
})();

