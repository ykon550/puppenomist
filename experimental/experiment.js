    const button = await page.$$eval('span', items => items
                .filter(item => item.textContent == 'Log in or sign upManage subscriptiondown icon')
    );
    await button[2].click();


    var data = await page.$$eval('span', items => {
        return items.map((item) => item.textContent);
    });
    data.map((data) => console.log(data));
    let but = data.filter((item) => {
        return item && item.includes('Log in');
    })
    console.log(but);

 
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


    var data = await page.$$eval('a', elems => {
        return elems.map((elem) => elem.href);
    });
    let but = data.filter((item) => {
            return item && item.includes('authenticate')
        })
    console.log(but[0]);
    const loginUrl = but[0];
    await page.goto(loginUrl, {waitUntil: 'networkidle2'});
    await sleep(2000);
    const email = await page.focus('input[type="email"]');
    await page.type('input[type="email"]', process.env.USER_EMAIL);
    await sleep(2000);
    const password = await page.focus('input[type="password"]');
    await page.type('input[type="password"]', process.env.USER_PASSWORD);
    await sleep(2000);
    const loginButton = await page.$("#submit-login");
    await sleep(2000);
    await loginButton.click();

    const loginBaloon = await page.$('a[target="_blank"]');
    console.log(loginBaloon);
    await loginBaloon.click();
    const loginEl = await page.$('button[type="submit"]');
    await loginEl.click();