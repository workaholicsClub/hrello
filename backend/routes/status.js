const shortid = require('shortid');

module.exports = {
    add: (db) => {
        return async (request, response) => {
            let statuses = db.collection('statuses');
            let statusData = request.body;
            statusData.id = shortid.generate();

            let result = await statuses.insertOne(statusData);
            let insertedStatusRecord = result.ops[0];

            response.send({
                status: insertedStatusRecord,
            });
        }
    },
    update: (db) => {
        return async (request, response) => {
            let statuses = db.collection('statuses');
            let newStatusData = request.body;
            let statusId = newStatusData.id;

            if (!statusId) {
                response.send({
                    status: false
                });
            }

            if (newStatusData._id) {
                delete newStatusData._id;
            }

            let query =  {id: statusId};
            let updateResult = await statuses.findOneAndReplace(query, newStatusData, {returnNewDocument: true});
            let updatedStatusRecord = updateResult.value || false;

            response.send({
                status: updatedStatusRecord,
            });
        }
    },
    list: (db) => {
        return async (request, response) => {
            let statusesCollection = db.collection('statuses');
            let boardId = request.query.boardId || false;
            let statuses = false;

            if (boardId) {
                statuses = await statusesCollection
                    .find({boardId: boardId, archive: {$in: [null, false]}})
                    .sort({sort: 1})
                    .toArray();
            }

            response.send({
                status: statuses,
            });
        }
    },
    archive: (db) => {
        return async (request, response) => {
            let statuses = db.collection('statuses');
            let statusId = request.query.statusId || false;

            if (!statusId) {
                response.send({
                    status: false
                });
            }

            let query =  {id: statusId};
            let updateResult = await statuses.findOneAndUpdate(query, {$set: {archive: true}});
            let updatedStatusRecord = updateResult.value || false;

            response.send({
                status: updatedStatusRecord,
            });
        }
    },
};