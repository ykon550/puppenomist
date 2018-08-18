const util = require('./util');
const fs = require('fs');

class Scraper {
    constructor(page, issueLink) {
        this.page = page;
        this.issueLink = issueLink;
        this.links = []; // links for Articles
    }

    // wrapper for Puppeteer.page.goto()
    // retry if failed.
    async goto(link) {
        const RETRY_MAX = 3;
        for (let cnt = 1; cnt <= RETRY_MAX; cnt++) {
            try {
                await this.page.goto(link, { timeout: 30000, waitUntil: 'networkidle2' });
                break;
            } catch (err) {
                console.log("page loading failed for " + cnt + " times, " + link);
                if (cnt == RETRY_MAX) {
                    console.log("retried " + RETRY_MAX + " times but still failed, will be skipped " + link);
                    throw Error("Max retried");
                }
                console.log("retrying, ");
            }
        }
    }

    async scrapeArticle(link) {
        let article = {
            title: '',
            text: [],
            url: '',
            date: '',
            section: '',
            filename: '',
            fromUrl: ''
        };
        await Promise.all([
            await util.sleep(),
            await this.goto(link)
        ]);

        // expected URL example, https://www.economist.com/middle-east-and-africa/2018/07/26/zimbabwes-opposition-is-gaining-ground-ahead-of-upcoming-elections
        article.fromUrl = link;
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
        }).catch((err) => {
            throw Error(err.message);
        });
        return article;
    }

    async scrape() {
        if(this.links.length == 0) throw new Error("No links to be scraped");
        const numArticles = this.links.length;
        for (const [idx, link] of this.links.entries()) {
            let article = {};
            try {
                article = await this.scrapeArticle(link);
            } catch (err) {
                console.log(err);
                console.log("skipped " + link);
                continue;
            }
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

    //TODO
    //before 2014, the url starts with /nodes/ . not /news/
    async extractArticleLinks() {
        const ARTICLE_URL_START = "https://www.economist.com/news/";
        await util.sleep();
        await this.goto(this.issueLink, { timeout: 100000, waitUntil: 'networkidle2' });

        let articleLinks = [];
        try {
            const anchors = await this.page.$x('//main//a')
                .catch((err) => {
                    console.log(err);
                });
            for (const a of anchors) {
                let link = await this.page.evaluate(a => a.href, a);
                if (link.startsWith(ARTICLE_URL_START)) {
                    articleLinks.push(link);
                }
            }
        } catch (e) {
            console.log("error: " + e);
        }
        this.links = articleLinks;

        return articleLinks;
    }

}

module.exports = Scraper;