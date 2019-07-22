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
    }
};