const shortid = require('shortid');

module.exports = {
    listGlobal: (db) => {
        return async (request, response) => {
            let globalFieldsCollection = db.collection('globalFields');

            let boardIds = request.query.boardIds || false;
            let userId = request.query.userId || false;
            let fetchGlobalEvents = boardIds || userId;

            let fields = [];

            if (fetchGlobalEvents) {
                let globalQuery = {};
                if (boardIds) {
                    globalQuery['boardId'] = { $in: boardIds };
                }

                if (userId) {
                    globalQuery['userId'] = userId;
                }

                fields = await globalFieldsCollection.find(globalQuery).toArray();
            }

            response.send({
                fields: fields
            });
        }
    },
    addGlobal: (db) => {
        return async (request, response) => {
            let globalFields = db.collection('globalFields');
            let fieldData = request.body;

            fieldData.id = shortid.generate();

            let result = await globalFields.insertOne(fieldData);
            let insertedFieldRecord = result.ops[0];

            let globalQuery = {};
            let fields = false;
            let fetchFields = fieldData.boardId || fieldData.userId;

            if (fieldData.boardId) {
                globalQuery['boardId'] = fieldData.boardId;
            }

            if (fieldData.userId) {
                globalQuery['userId'] = fieldData.userId;
            }

            if (fetchFields) {
                fields = await globalFields.find(globalQuery).toArray();
            }

            response.send({
                field: insertedFieldRecord,
                fields: fields
            });
        }
    },
    updateGlobal: (db) => {
        return async (request, response) => {
            let globalFields = db.collection('globalFields');
            let fieldData = request.body;

            let fieldId = fieldData.id || false;

            if (!fieldId) {
                response.send({field: false})
            }

            if (fieldData._id) {
                delete fieldData._id;
            }


            let updateResult = await globalFields.findOneAndReplace({id: fieldId}, fieldData, {returnNewDocument: true});
            let fieldRecord = updateResult.value || false;

            response.send({
                field: fieldRecord,
            });
        }
    },
    add: (db) => {
        return async (request, response) => {
            let cards = db.collection('cards');
            let cardId = request.body.cardId;
            let boardId = request.body.boardId;

            let newFieldData = request.body.fieldData;
            let query = {
                id: cardId,
                boardId: boardId
            };

            if (!cardId || !boardId) {
                response.send({
                    success: false
                });

                return;
            }

            let card = await cards.findOne(query);
            let docId = card._id;
            delete card._id;
            card.content.unshift(newFieldData);

            let updateResult = await cards.findOneAndReplace({_id: docId}, card, {returnNewDocument: true});
            let updatedCardRecord = updateResult.value || false;

            response.send({
                card: updatedCardRecord,
            });
        }
    },
    update: (db) => {
        return async (request, response) => {
            let cards = db.collection('cards');
            let cardId = request.body.cardId;
            let boardId = request.body.boardId;
            let fieldId = request.body.fieldId;
            let changedFieldData = request.body.changedData;
            let query = {
                id: cardId,
                boardId: boardId
            };

            if (!cardId || !boardId || !fieldId) {
                response.send({
                    success: false
                });

                return;
            }

            let card = await cards.findOne(query);

            let newCardData = card.content.map( contentItem => {
                if (contentItem.id === fieldId) {
                    return Object.assign(contentItem, changedFieldData);
                }

                return contentItem;
            });

            let docId = card._id;
            delete card._id;
            card.content = newCardData;

            let updateResult = await cards.findOneAndReplace({_id: docId}, card, {returnNewDocument: true});
            let updatedCardRecord = updateResult.value || false;

            response.send({
                card: updatedCardRecord,
            });
        }
    }

};