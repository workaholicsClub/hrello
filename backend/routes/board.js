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