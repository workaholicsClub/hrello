const shortid = require('shortid');

function getBoardTemplateStatusesAndFields(boardId) {
    return [
        {
            id: shortid.generate(),
            boardId: boardId,
            sort: 1,
            title: 'Входящие',
            fields: [
                {'title': 'Посмотреть резюме', 'type': 'checkbox', 'id': shortid.generate()},
                {'title': 'Резюме подходит', 'type': 'color', 'id': shortid.generate()},
                {'title': 'Связаться с кандидатом', 'type': 'checkbox', 'id': shortid.generate()},
            ],
        },
        {
            id: shortid.generate(),
            boardId: boardId,
            sort: 2,
            title: 'Собеседование',
            fields: [
                {'title': 'Дата собеседования', 'type': 'datetime', 'id': shortid.generate()},
                {'title': 'Письмо с адресом отправлено', 'type': 'checkbox', 'id': shortid.generate()},
                {'title': 'Кандидат подходит', 'type': 'color', 'id': shortid.generate()},
                {'title': 'Предложение сделано', 'type': 'checkbox', 'id': shortid.generate()},
                {'title': 'Предложение принято', 'type': 'checkbox', 'id': shortid.generate()},
            ],
        },
        {
            id: shortid.generate(),
            boardId: boardId,
            sort: 3,
            title: 'Выход на работу',
            fields: [
                {'title': 'Дата выхода', 'type': 'datetime', 'id': shortid.generate()},
                {'title': 'Список документов отправлен', 'type': 'checkbox', 'id': shortid.generate()},
                {'title': 'Кандидат вышел', 'type': 'checkbox', 'id': shortid.generate()},
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
                statuses: insertedStatusRecords,
            });
        }
    },
    list: (db) => {
        return async (request, response) => {
            let boardsCollection = db.collection('boards');
            let userId = request.query.userId || false;
            let boards = [];
            if (userId) {
                boards = await boardsCollection.find({userId: userId}).toArray();
            }

            response.send({
                boards: boards
            });
        }
    }
};