const shortid = require('shortid');

async function archive(db, cardId, list) {
    let cards = db.collection('cards');

    if (!cardId) {
        return false;
    }

    let newAttrs = {};
    newAttrs[list] = true;

    let query = {id: cardId};
    let updateResult = await cards.findOneAndUpdate(query, {$set: newAttrs});
    let updatedCardRecord = updateResult.value || false;

    return updatedCardRecord;
}

module.exports = {
    add: (db) => {
        return async (request, response) => {
            let cards = db.collection('cards');

            let cardData = request.body;
            cardData.id = shortid.generate();

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
    findOne: (db) => {
        return async (request, response) => {
            let cardsCollection = db.collection('cards');
            let cardId = request.query.cardId || false;
            let boardIds = request.query.boardIds || false;
            let userId = request.query.userId || false;
            let card = false;

            let query = {
                id: cardId
            };

            if (boardIds) {
                query['boardId'] = { $in: boardIds };
            }
            else if (userId) {
                query['guestIds'] = { $elemMatch: {$eq: userId} };
            }

            let canLoad = (cardId && boardIds) || (cardId && userId);

            if (canLoad) {
                card = await cardsCollection.findOne(query);
            }

            response.send({
                card: card
            });
        }
    },
    list: (db) => {
        return async (request, response) => {
            let cardsCollection = db.collection('cards');
            let boardId = request.query.boardId || false;
            let guestId = request.query.guestId || false;

            let cards = [];
            if (boardId) {
                cards = await cardsCollection.find({
                    boardId: boardId,
                    archive: {$in: [null, false]},
                    whitelist: {$in: [null, false]},
                    blacklist: {$in: [null, false]},
                    finishedlist: {$in: [null, false]},
                    deleted: {$in: [null, false]}
                }).toArray();
            }
            else if (guestId) {
                cards = await cardsCollection.find({
                    guestIds: { $elemMatch: {$eq: guestId} },
                    archive: {$in: [null, false]},
                    whitelist: {$in: [null, false]},
                    blacklist: {$in: [null, false]},
                    finishedlist: {$in: [null, false]},
                    deleted: {$in: [null, false]}
                }).toArray();
            }

            response.send({
                card: cards
            });
        }
    },
    listArchive: (db) => {
        return async (request, response) => {
            let userId = request.query.userId || false;
            let archiveType = request.query.archiveType || false;

            if (!userId || !archiveType) {
                response.send({
                    card: false
                });
                return;
            }

            let boardsCollection = db.collection('boards');
            let boards = await boardsCollection.find({
                userId: userId,
            }).toArray();
            let boardIds = boards.map(board => board.id);

            if (!boardIds) {
                response.send({
                    card: false
                });
                return;
            }

            let cardsCollection = db.collection('cards');
            let query = {
                boardId: {$in: boardIds}
            };
            query[archiveType] = true;

            let cards = await cardsCollection.find(query).toArray();

            response.send({
                card: cards
            });
        }
    },
    whitelist: (db) => {
        return async (request, response) => {
            let cardId = request.query.cardId || false;
            let updatedCard = archive(db, cardId, 'whitelist');

            response.send({
                card: updatedCard
            });
        }
    },
    blacklist: (db) => {
        return async (request, response) => {
            let cardId = request.query.cardId || false;
            let updatedCard = archive(db, cardId, 'blacklist');

            response.send({
                card: updatedCard
            });
        }
    },
    finishedlist: (db) => {
        return async (request, response) => {
            let cardId = request.query.cardId || false;
            let updatedCard = archive(db, cardId, 'finishedlist');

            response.send({
                card: updatedCard
            });
        }
    },
    delete: (db) => {
        return async (request, response) => {
            let cardId = request.query.cardId || false;
            let updatedCard = archive(db, cardId, 'deleted');

            response.send({
                card: updatedCard
            });
        }
    },
};