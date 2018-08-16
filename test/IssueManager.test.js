const IssueManager = require('../lib/IssueManager');

const testLinks = [ 
  'https://www.economist.com/printedition/2018-08-11',
  'https://www.economist.com/printedition/2018-08-04',
  'https://www.economist.com/printedition/2018-07-28',
  'https://www.economist.com/printedition/2018-07-21',
  'https://www.economist.com/printedition/2018-07-14',
  'https://www.economist.com/printedition/2018-07-07',
  'https://www.economist.com/printedition/2018-06-30',
  'https://www.economist.com/printedition/2018-06-23',
  'https://www.economist.com/printedition/2018-06-16',
  'https://www.economist.com/printedition/2018-06-09',
  'https://www.economist.com/printedition/2018-06-02',
  'https://www.economist.com/printedition/2018-05-26',
  'https://www.economist.com/printedition/2018-05-19',
  'https://www.economist.com/printedition/2018-05-12',
  'https://www.economist.com/printedition/2018-05-05',
  'https://www.economist.com/printedition/2018-04-28',
  'https://www.economist.com/printedition/2018-04-21',
  'https://www.economist.com/printedition/2018-04-14'
];

const issueMgr = new IssueManager(true, 2018);

issueMgr.issueLinks = testLinks;

issueMgr.initStatus();