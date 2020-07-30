module.exports = {
    async getGlobalContent(db, boardId) {
        let cardsCollection = db.collection('cards');

        let query = {content: {$elemMatch: {'isGlobal': true}}};
        if (boardId) {
            query['boardId'] = boardId;
        }

        let cards = await cardsCollection.find(query).toArray();

        let items = [];
        let itemNames = [];

        cards.forEach(card => {

            card.content.forEach( content => {
                let wasNotAdded = content.isGlobal && itemNames.indexOf(content.name) === -1;

                if (wasNotAdded) {

                    content.value = null;
                    content.valueAuthor = null;
                    content.valueDate = null;
                    content.refCardId = card.id;

                    items.push(content);
                    itemNames.push(content.name);
                }

            });

        });

        return items;
    },
};