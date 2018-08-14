# Puppenomist = Tha Scraper for The Ecnomist with Puppeteer.

## How to Use
1. Install 
```
$ npm install puppenomist
```

2. Move to the Installed directory and Run the command
```
$ cd ./node_modules/puppenomist
$ node index.js -v
```
-v option is for NON Headless mode, it might be useful for first trial.

## Example
```
$ node index.js -v
prompt: Email:  XXXXXXX@XMAIL.COM
prompt: Password:  ********

trying to login...
succeeded to login!
trying to extract issue links...
Issue links extracted!
started https://www.economist.com/printedition/2018-08-11
-->1/77: 2018_08_11_politics-this-week.json saved!
-->2/77: 2018_08_11_business-this-week.json saved!
-->3/77: 2018_08_11_kals-cartoon.json saved!
-->4/77: 2018_08_09_overhaul-tax-for-the-21st-century.json saved!
-->5/77: 2018_08_11_many-american-states-are-making-voting-harder.json saved!
-->6/77: 2018_08_11_the-danger-posed-by-jair-bolsonaro.json saved!
...
```

## Notes
It requires subscription account for The Ecnomist.