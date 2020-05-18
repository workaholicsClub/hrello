const shortid = require('shortid');
const crypto = require('crypto');

function md5(string) {
    return crypto.createHash('md5').update(string).digest("hex");
}


module.exports = {
    add: (db) => {
        return async (request, response) => {
            let users = db.collection('users');
            let userData = request.body;

            userData.id = shortid.generate();
            userData.earlyAdopter = true;
            userData.dateRegistered = (new Date).toString();

            let result = await users.insertOne(userData);
            let insertedUserRecord = result.ops[0];

            response.send({
                user: insertedUserRecord,
            });
        }
    },
    login: (db) => {
        return async (request, response) => {
            let email = request.body.email;
            let passwordHash = md5(request.body.password);

            let users = db.collection('users');
            let loadedUserData = await users.findOne({ email: email, passwordHash: passwordHash });
            let isLoaded = Boolean(loadedUserData);

            if (isLoaded) {
                delete loadedUserData.passwordHash;
            }

            response.send({
                user: loadedUserData,
                error: isLoaded ? false : 'Электропочта или пароль не подходят',
            });
        };
    },
    register: (db) => {
        return async (request, response) => {
            let fullName = request.body.name;
            let email = request.body.email;
            let passwordHash = md5(request.body.password);
            let [firstName, familyName] = fullName.split(' ');

            let emailHash = md5( email.toLowerCase() );
            let gravatarUrl = "https://www.gravatar.com/avatar/"+emailHash+".jpg?d=identicon";

            let userData = {
                "id" : shortid.generate(),
                "dateRegistered": (new Date).toString(),
                "fullName" : fullName,
                "firstName" : firstName,
                "familyName" : familyName,
                "imageUrl" : gravatarUrl,
                "email" : email,
                "passwordHash": passwordHash,
                "earlyAdopter" : true
            };

            let users = db.collection('users');

            let existingUser = await users.findOne({ email: email });
            if (existingUser) {
                response.send({
                    user: false,
                    error: 'Пользователь с такой электропочтой уже зарегистрирован'
                });
            }
            else {
                let insertResult = await users.insertOne(userData);
                let userRecord = insertResult.ops[0] || false;
                delete userRecord.passwordHash;

                response.send({
                    user: userRecord,
                    error: false
                });
            }
        };
    },
    googleLogin: (db) => {
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

            if (!loadedUserData.dateRegistered) {
                loadedUserData.dateRegistered = new Date;
            }

            let userRecord = false;

            if (!loadedUserData.id) {
                loadedUserData.id = shortid.generate();
                loadedUserData.dateRegistered = (new Date).toString();

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
    },
    team: (db) => {
        return async (request, response) => {
            let users = db.collection('users');
            let boards = db.collection('boards');
            let userId = request.query.userId || false;

            if (!userId) {
                response.send({
                    user: false
                });
                return;
            }

            let foundBoards = await boards.find({
                $or: [
                    {userId: userId},
                    {guestIds: { $elemMatch: {$eq: userId} }}
                ],
                archive: {$in: [null, false]},
                deleted: {$in: [null, false]},
            }).toArray();

            let teamUsersIds = foundBoards
                .reduce( (foundIds, board) => {
                    if (board.guestIds && board.guestIds.length > 0) {
                        foundIds = foundIds.concat(board.guestIds);
                    }

                    if (board.userId) {
                        foundIds.push(board.userId);
                    }

                    return foundIds;
                }, [])
                .filter((current, index, array) => array.indexOf(current) === index);

            let teamUsers = await users.find({
                id: {$in: teamUsersIds}
            }).toArray();

            response.send({
                user: teamUsers,
            });
        }
    }
};