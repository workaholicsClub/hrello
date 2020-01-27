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
    }

};