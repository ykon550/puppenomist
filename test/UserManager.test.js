
// test for prompt
const dummyPage = {};
const UserManager = require('../lib/UserManager');
const userMgr = new UserManager(dummyPage);

(async() => {
    await userMgr.askAccount();
})();