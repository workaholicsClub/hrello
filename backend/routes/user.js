const shortid = require('shortid');

module.exports = {
    add: (db) => {
        return async (request, response) => {
            let users = db.collection('users');
            let userData = request.body;

            userData.id = shortid.generate();
            userData.earlyAdopter = true;

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
            let userDataInRequest = request.body;
            let hasEmail = userDataInRequest && userDataInRequest.email;

            if (!hasEmail) {
                return response.send({user: false});
            }
            
            let loadedUserData = await users.findOne({ email: userDataInRequest.email });

            if (!loadedUserData) {
                loadedUserData = userDataInRequest;
            }

            if (!loadedUserData.earlyAdopter) {
                loadedUserData.earlyAdopter = true;
            }

            let userRecord = false;

            if (!loadedUserData.id) {
                loadedUserData.id = shortid.generate();
                let insertResult = await users.insertOne(loadedUserData);
                userRecord = insertResult.ops[0] || false;
            }
            else {
                let updateResult = await users.findOneAndReplace({ email: loadedUserData.email }, loadedUserData, {returnNewDocument: true});
                userRecord = updateResult.value || false;
            }

            response.send({
                user: userRecord,
            });
        }
    }
};