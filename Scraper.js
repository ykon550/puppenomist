require('dotenv').config();
const util = require('./util');
const fs = require('fs');

class Scraper {
    constructor(page, links) {
        this.page = page;
        this.links = links;
    }
    filter() {
        return this;
    }

    async scrapeArticle(link) {
        let article = {
            title: '',
            text: [],
            url: '',
            date: '',
            section: '',
            filename: ''
        };
        await util.randomSleep();
        await this.page.goto(link, { timeout: 100000, waitUntil: 'networkidle2' });
        // expected URL example, https://www.economist.com/middle-east-and-africa/2018/07/26/zimbabwes-opposition-is-gaining-ground-ahead-of-upcoming-elections
        article.url = await this.page.url();
        article.title = article.url.split('/').slice(-4).join('_');
        article.section = article.url.split('/').slice(3, 4).join();
        article.date = article.url.split('/').slice(4, 7).join('');
        article.dir = article.url.split('/').slice(4, 6).join('');
        article.filename = article.title + '.json';
    
        article.text = await this.page.evaluate(() => {
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
        }).catch((err) => console.log(err));
        return article;
    }

    async scrape() {
        const numArticles = this.links.length;
        for (const [idx, link] of this.links.entries()) {
            const article = await this.scrapeArticle(link)
                .catch((err)=>{
                    console.log(err);
                    console.log("skipped " + link);
                });
            const dir = './articles/' + article.dir + '/';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            fs.writeFile(dir + article.filename, JSON.stringify(article, null, '\t'), (err) => {
                if (err) console.log("error: " + err);
                console.log('-->' + parseInt(parseInt(idx) + 1) + '/' + numArticles + ': ' + article.filename + " saved!");
            })
        }
    }

}

module.exports = Scraper;