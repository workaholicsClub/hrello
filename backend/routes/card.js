const shortid = require('shortid');

module.exports = {
    add: (db) => {
        return async (request, response) => {
            let cards = db.collection('cards');
            let cardData = request.body;
            cardData.id = shortid.generate();
            cardData.archive = false;

            let result = await cards.insertOne(cardData);
            let insertedCardRecord = result.ops[0];

            response.send({
                card: insertedCardRecord,
            });
        }
    },
    update: (db) => {
        return async (request, response) => {
            let cards = db.collection('cards');
            let newCardData = request.body;
            let cardId = newCardData.id;

            if (!cardId) {
                response.send({
                    card: false
                });
            }

            if (newCardData._id) {
                delete newCardData._id;
            }

            let query =  {id: cardId};
            let updateResult = await cards.findOneAndReplace(query, newCardData, {returnNewDocument: true});
            let updatedCardRecord = updateResult.value || false;

            response.send({
                card: updatedCardRecord,
            });
        }
    },
    list: (db) => {
        return async (request, response) => {
            let cardsCollection = db.collection('cards');
            let boardId = request.query.boardId || false;
            let cards = [];
            if (boardId) {
                cards = await cardsCollection.find({boardId: boardId, archive: {$in: [null, false]}}).toArray();
            }

            response.send({
                card: cards
            });
        }
    },
    archive: (db) => {
        return async (request, response) => {
            let cards = db.collection('cards');
            let cardId = request.query.cardId || false;

            if (!cardId) {
                response.send({
                    card: false
                });
            }

            let query =  {id: cardId};
            let updateResult = await cards.findOneAndUpdate(query, {$set: {archive: true}});
            let updatedCardRecord = updateResult.value || false;

            response.send({
                card: updatedCardRecord,
            });
        }
    },
};