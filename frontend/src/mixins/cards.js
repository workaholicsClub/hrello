import axios from "axios";

export default {
    data() {
        return {
            currentCard: false,
            cards: [],
        }
    },
    methods: {
        async loadCard(cardId) {
            let cardResponse = await axios.get('/api/card/findOne', {
                params: {
                    cardId: cardId,
                    userId: this.userId,
                    boardIds: this.boardIds
                }
            });
            return cardResponse.data.card;
        },
        async loadBoardCards() {
            let cardsResponse = await axios.get('/api/card/list', {
                params: {
                    boardId: this.currentBoardId
                }
            });

            this.cards = cardsResponse.data.card;
        },
        async changeCard(newCardId, skipUrlUpdate) {
            let foundCard = this.findCard(newCardId);

            if (!foundCard) {
                foundCard = await this.loadCard(newCardId);
            }

            if (foundCard) {
                this.currentCard = foundCard;

                if (!skipUrlUpdate) {
                    this.updateUrl();
                }
            }
        },
        async addCard(status) {
            let newCard = {
                statusId: status.id,
                boardId: status.boardId
            };

            let response = await axios.post('/api/card/add', newCard);
            let createdCard = response.data.card;

            this.cards.unshift(createdCard);
        },
        async addContentToCard(content, card) {
            if (typeof (card['content']) === 'undefined') {
                this.$set(card, 'content', []);
            }

            content.date = new Date();
            content.author = this.user;

            let newCardContent = card.content.concat();
            newCardContent.unshift(content);

            this.$set(card, 'content', newCardContent);

            return this.saveCard(card);
        },
        async updateContent(newValue, newContent, oldContent, card) {
            let contentIndex = card.content.indexOf(oldContent);

            newContent.value = newValue;
            newContent.valueAuthor = this.user;
            newContent.valueDate = new Date();

            this.$set(card.content, contentIndex, newContent);

            return this.saveCard(card);
        },
        async updateContentValue(value, content, card) {
            let contentIndex = card.content.indexOf(content);

            content.value = value;
            content.valueAuthor = this.user;
            content.valueDate = new Date();

            this.$set(card.content, contentIndex, content);

            return this.saveCard(card);
        },
        async moveCardToWhiteList(card) {
            let response = await axios.get('/api/card/whitelist', {
                params: {
                    cardId: card.id
                }
            });

            this.reloadBoardData();

            return response.data.card;
        },
        async moveCardToBlackList(card) {
            let response = await axios.get('/api/card/blacklist', {
                params: {
                    cardId: card.id
                }
            });

            this.reloadBoardData();

            return response.data.card;
        },
        async moveCardToFinishedList(card) {
            let response = await axios.get('/api/card/finishedlist', {
                params: {
                    cardId: card.id
                }
            });

            this.reloadBoardData();

            return response.data.card;
        },
        async moveCardToNextStatus(card) {
            let nextStatus = this.getNextStatusForCard(card);
            if (nextStatus) {
                card.statusId = nextStatus.id;
                this.saveCard(card);
            }
        },
        async moveCardToPrevStatus(card) {
            let previousStatus = this.getPreviousStatusForCard(card);
            if (previousStatus) {
                card.statusId = previousStatus.id;
                this.saveCard(card);
            }
        },

        async saveCard(card) {
            return axios.post('/api/card/update', card);
        },

        findCard(cardId) {
            let foundCards = this.cards.filter(card => card.id === cardId);
            return foundCards.length > 0 ? foundCards[0] : false;
        },
        getNextStatusForCard(card) {
            let nextStatus = this.statuses.reduce((result, iteratedStatus) => {
                if (iteratedStatus.id === card.statusId) {
                    return true;
                }

                if (result === true) {
                    return iteratedStatus;
                }

                return result;
            }, false);

            if (nextStatus === true) {
                nextStatus = false;
            }

            return nextStatus;
        },
        getPreviousStatusForCard(card) {
            let currentStatusIndex = this.statuses.reduce((result, iteratedStatus, index) => {
                if (iteratedStatus.id === card.statusId) {
                    return index;
                }

                return result;
            }, false);

            if (currentStatusIndex > 0) {
                return this.statuses[currentStatusIndex-1];
            }

            return false;
        },
    },
    computed: {
        currentCardId() {
            return this.currentCard ? this.currentCard.id : false;
        }
    },
    mounted() {
        this.$root.$on('addCard', this.addCard);
        this.$root.$on('selectCard', this.changeCard);
        this.$root.$on('cardInput', this.saveCard);

        this.$root.$on('newContentCard', this.addContentToCard);
        this.$root.$on('updateContentCard', this.updateContent);
        this.$root.$on('updateContentValueCard', this.updateContentValue);

        this.$root.$on('moveCardToNextStatus', this.moveCardToNextStatus);
        this.$root.$on('moveCardToPrevStatus', this.moveCardToPrevStatus);
        this.$root.$on('moveCardToWhiteList', this.moveCardToWhiteList);
        this.$root.$on('moveCardToBlackList', this.moveCardToBlackList);
        this.$root.$on('moveCardToFinishedList', this.moveCardToFinishedList);
    },
    beforeDestroy() {
        this.$root.$off('addCard', this.addCard);
        this.$root.$off('selectCard', this.changeCard);
        this.$root.$off('cardInput', this.saveCard);

        this.$root.$off('newContentCard', this.addContentToCard);
        this.$root.$off('updateContentCard', this.updateContent);
        this.$root.$off('updateContentValueCard', this.updateContentValue);

        this.$root.$off('moveCardToNextStatus', this.moveCardToNextStatus);
        this.$root.$off('moveCardToPrevStatus', this.moveCardToPrevStatus);
        this.$root.$off('moveCardToWhiteList', this.moveCardToWhiteList);
        this.$root.$off('moveCardToBlackList', this.moveCardToBlackList);
        this.$root.$off('moveCardToFinishedList', this.moveCardToFinishedList);
    }
}