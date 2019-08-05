const shortid = require('shortid');

function getBoardTemplateStatusesAndFields(boardId) {
    return [
        {
            id: shortid.generate(),
            boardId: boardId,
            sort: 0,
            title: 'Входящие',
            fields: [
                {'title': 'Посмотреть резюме', 'type': 'checkbox', 'id': shortid.generate(), sort: 0},
                {'title': 'Резюме подходит', 'type': 'color', 'id': shortid.generate(), sort: 1},
                {'title': 'Связаться с кандидатом', 'type': 'checkbox', 'id': shortid.generate(), sort: 2},
            ],
        },
        {
            id: shortid.generate(),
            boardId: boardId,
            sort: 1,
            title: 'Собеседование',
            fields: [
                {'title': 'Дата собеседования', 'type': 'datetime', 'id': shortid.generate(), sort: 0},
                {'title': 'Письмо с адресом отправлено', 'type': 'checkbox', 'id': shortid.generate(), sort: 1},
                {'title': 'Кандидат подходит', 'type': 'color', 'id': shortid.generate(), sort: 2},
                {'title': 'Предложение сделано', 'type': 'checkbox', 'id': shortid.generate(), sort: 3},
                {'title': 'Предложение принято', 'type': 'checkbox', 'id': shortid.generate(), sort: 4},
            ],
        },
        {
            id: shortid.generate(),
            boardId: boardId,
            sort: 2,
            title: 'Выход на работу',
            fields: [
                {'title': 'Дата выхода', 'type': 'datetime', 'id': shortid.generate(), sort: 0},
                {'title': 'Список документов отправлен', 'type': 'checkbox', 'id': shortid.generate(), sort: 1},
                {'title': 'Кандидат вышел', 'type': 'checkbox', 'id': shortid.generate(), sort: 2},
            ],
        },
    ]
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

            response.send({
                board: insertedBoardRecord,
                status: insertedStatusRecords,
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
            let statusesCollection = db.collection('statuses');
            let userId = request.query.userId || false;
            let boards = [];
            if (userId) {
                boards = await boardsCollection.find({userId: userId}).toArray();
            }

            response.send({
                board: boards
            });
        }
    }
};