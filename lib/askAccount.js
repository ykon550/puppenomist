const prompt = require('prompt');
const colors = require('colors/safe');

const askAccount = async () => {
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
            if(err) reject(err);
            resolve(result);
        });
    });
}

module.exports = askAccount;