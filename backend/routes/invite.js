module.exports = {
    card: (db) => {
        return async (request, response) => {
            let userId = request.body.userId;
            let cardId = request.body.targetId;

            let cards = db.collection('cards');

            let card = false;
            let updatedCardRecord = false;

            if (cardId) {
                card = await cards.findOne({id: cardId});
            }

            if (card) {
                if (!card.guestIds) {
                    card.guestIds = [];
                }

                if (card.guestIds.indexOf(userId) === -1) {
                    card.guestIds.push(userId);
                }

                let updateResult = await cards.findOneAndReplace({id: cardId}, card, {returnNewDocument: true});
                updatedCardRecord = updateResult.value ? card : false;
            }

            response.send({
                card: updatedCardRecord,
            });
        }
    },
    board: (db) => {
        return async (request, response) => {
            let userId = request.body.userId;
            let boardId = request.body.targetId;

            let boards = db.collection('boards');

            let board = false;
            let updatedBoardRecord = false;

            if (boardId) {
                board = await boards.findOne({id: boardId});
            }

            if (board) {
                if (!board.guestIds) {
                    board.guestIds = [];
                }

                if (board.guestIds.indexOf(userId) === -1) {
                    board.guestIds.push(userId);
                }

                let updateResult = await boards.findOneAndReplace({id: boardId}, board, {returnNewDocument: true});
                updatedBoardRecord = updateResult.value ? board : false;
            }

            response.send({
                board: updatedBoardRecord,
            });
        }
    }
};