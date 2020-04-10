const shortid = require('shortid');

function getBoardTemplateStatusesAndFields(boardId) {
    return [
        {
            id: shortid.generate(),
            boardId: boardId,
            sort: 100,
            title: 'Входящие',
        },
        {
            id: shortid.generate(),
            boardId: boardId,
            sort: 200,
            title: 'Собеседование',
        },
        {
            id: shortid.generate(),
            boardId: boardId,
            sort: 300,
            title: 'Выход на работу',
        },
    ]
}

function getCardTemplates(statusIds, boardId) {
    return statusIds.map( (statusId, index) => {
        return {
            id: shortid.generate(),
            name: 'Кандидат ' + (index+1),
            statusId: statusId,
            boardId: boardId
        }
    });
}

module.exports = {
    add: (db) => {
        return async (request, response) => {
            let boardsCollection = db.collection('boards');
            let boardData = request.body;
            let newBoardId = shortid.generate();
            boardData.id = newBoardId;

            let result = await boardsCollection.insertOne(boardData);
            let insertedBoardRecord = result.ops[0];

            let statuses = db.collection('statuses');
            let templateStatuses = getBoardTemplateStatusesAndFields(newBoardId);
            let statusesResult = await statuses.insertMany(templateStatuses);
            let insertedStatusRecords = statusesResult.ops;

            let cards = db.collection('cards');
            let statusIds = templateStatuses.map( (status) => status.id );
            let templateCards = getCardTemplates(statusIds, newBoardId);
            let cardsResult = await cards.insertMany(templateCards);
            let insertedCardsRecords = cardsResult.ops;

            response.send({
                board: insertedBoardRecord,
                status: insertedStatusRecords,
                card: insertedCardsRecords
            });
        }
    },
    copy: (db) => {
        return async (request, response) => {
            let boardsCollection = db.collection('boards');

            let srcBoardData = request.body;
            let srcBoardId = srcBoardData.id;
            let newBoardData = srcBoardData;
            let newBoardId = shortid.generate();

            newBoardData.id = newBoardId;
            newBoardData.title += ' (копия)';
            delete newBoardData._id;
            delete newBoardData.filterValues;
            delete newBoardData.guestIds;
            delete newBoardData.vacancyText;

            let result = await boardsCollection.insertOne(newBoardData);
            let insertedBoardRecord = result.ops[0];

            let statusesCollection = db.collection('statuses');
            let statuses = await statusesCollection
                .find({
                    boardId: srcBoardId,
                    archive: {$in: [null, false]},
                    deleted: {$in: [null, false]},
                })
                .sort({sort: 1})
                .toArray();

            let newStatuses = statuses.map((status) => {
                let newStatus = status;
                newStatus.boardId = newBoardId;
                delete newStatus._id;
                return newStatus;
            });

            let statusesResult = await statusesCollection.insertMany(newStatuses);
            let insertedStatusRecords = statusesResult.ops;

            response.send({
                board: insertedBoardRecord,
                status: insertedStatusRecords
            });
        }
    },

    update: (db) => {
        return async (request, response) => {
            let boards = db.collection('boards');
            let newBoardData = request.body;
            let boardId = newBoardData.id;

            if (!boardId) {
                response.send({
                    board: false
                });
            }

            if (newBoardData._id) {
                delete newBoardData._id;
            }

            let query =  {id: boardId};
            let updateResult = await boards.findOneAndReplace(query, newBoardData, {returnNewDocument: true});
            let updatedBoardRecord = updateResult.value || false;

            response.send({
                board: updatedBoardRecord,
            });
        }
    },
    list: (db) => {
        return async (request, response) => {
            let boardsCollection = db.collection('boards');
            let userId = request.query.userId || false;
            let boards = [];
            if (userId) {
                boards = await boardsCollection.find({
                    $or: [
                        {userId: userId},
                        {guestIds: { $elemMatch: {$eq: userId} }}
                    ],
                    archive: {$in: [null, false]},
                    deleted: {$in: [null, false]},
                }).toArray();
            }

            response.send({
                board: boards
            });
        }
    },
    archive: (db) => {
        return async (request, response) => {
            let boards = db.collection('boards');
            let boardId = request.query.boardId || false;

            if (!boardId) {
                response.send({
                    board: false
                });
            }

            let query =  {id: boardId};
            let updateResult = await boards.findOneAndUpdate(query, {$set: {archive: true}});
            let updatedBoardRecord = updateResult.value || false;

            response.send({
                board: updatedBoardRecord,
            });
        }
    },
    delete: (db) => {
        return async (request, response) => {
            let boards = db.collection('boards');
            let boardId = request.query.boardId || false;

            if (!boardId) {
                response.send({
                    board: false
                });
            }

            let query =  {id: boardId};
            let updateResult = await boards.findOneAndUpdate(query, {$set: {deleted: true}});
            let updatedBoardRecord = updateResult.value || false;

            response.send({
                board: updatedBoardRecord,
            });
        }
    },
};