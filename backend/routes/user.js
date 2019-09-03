const shortid = require('shortid');

module.exports = {
    add: (db) => {
        return async (request, response) => {
            let users = db.collection('users');
            let userData = request.body;
            userData.id = shortid.generate();

            let result = await users.insertOne(userData);
            let insertedUserRecord = result.ops[0];

            response.send({
                user: insertedUserRecord,
            });
        }
    },
    login: (db) => {
        return async (request, response) => {
            let users = db.collection('users');
            let userData = request.body;
            userData.id = shortid.generate();

            let result = await users.findOneAndUpdate({ email: userData.email }, { $setOnInsert: userData }, {
                returnNewDocument: true,
                upsert: true
            });

            let userRecord = result.value;

            response.send({
                user: userRecord,
            });
        }
    }
};