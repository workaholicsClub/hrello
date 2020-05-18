import axios from "axios";
import shortid from "shortid";
import {clone} from "../unsorted/Helpers";

export default {
    data() {
        return {
            currentCard: false,
            cards: [],
            whitelistCards: [],
            archiveType: 'whitelist',
            archiveLoading: false,
            shareCard: null,
            shareDialog: false,
        }
    },
    methods: {
        async loadCard(cardId) {
            let requestParams = {
                cardId: cardId,
                userId: this.userId,
            };

            if (this.boardIds) {
                requestParams['boardIds'] = this.boardIds;
            }

            let cardResponse = await axios.get('/api/card/findOne', {
                params: requestParams
            });
            return cardResponse.data.card;
        },
        async loadAndUpdateBoardCards() {
            let cardsResponse = await axios.get('/api/card/list', {
                params: {
                    boardId: this.currentBoardId
                }
            });

            this.cards = cardsResponse.data.card;
        },
        async loadArchiveCards(type) {
            this.isLoading = true;
            let cardsResponse = await axios.get('/api/card/listArchive', {
                params: {
                    userId: this.user.id,
                    archiveType: type,
                }
            });

            this.isLoading = false;
            this.whitelistCards = cardsResponse.data.card;
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

            if (this.currentBoard && this.currentBoard.defaultContent) {
                newCard.content = clone(this.currentBoard.defaultContent).map( record => {
                    record.linkToDefaultById = record.id;
                    delete record.id;
                    return record;
                });
            }

            let response = await axios.post('/api/card/add', newCard);
            let createdCard = response.data.card;

            this.cards.push(createdCard);
            this.changeCard(createdCard.id);
        },
        async addContentToCard(content, card) {
            if (typeof (card['content']) === 'undefined') {
                this.$set(card, 'content', []);
            }

            content.id = shortid.generate();
            content.date = new Date();
            content.author = this.user;
            content.isEditing = true;
            content.version = 1;

            let newCardContent = card.content.concat();
            newCardContent.unshift(content);

            this.$set(card, 'content', newCardContent);

            return this.saveCard(card);
        },

        userHasAccess(board, card, user) {
            let isCardGuest = card.guestIds.indexOf(user.id) !== -1;

            if (!board) {
                return isCardGuest;
            }

            let isBoardOwner = board.userId === user.id;
            let isBoardGuest = board.guestIds.indexOf(user.id) !== -1;
            return isBoardOwner || isBoardGuest || isCardGuest;
        },

        async updateContent(newContent, oldContent, card) {
            let contentIndex = card.content.indexOf(oldContent);

            if (!newContent.id) {
                newContent.id = shortid.generate();
            }

            newContent.valueAuthor = this.user;
            newContent.valueDate = new Date();
            newContent.version = newContent.version ? newContent.version + 1 : 1;

            if (!this.onlyCardMode) {
                let needToAddNewDefaultField = newContent.isGlobal && !newContent.linkToDefaultById;
                let needToUpdateDefaultField = newContent.isGlobal && newContent.linkToDefaultById;
                let needToUnlinkDefaultField = !newContent.isGlobal && newContent.linkToDefaultById;

                if (needToAddNewDefaultField) {
                    let newDefaultContent = await this.addDefaultContent(newContent);
                    newContent.linkToDefaultById = newDefaultContent.id;
                }

                if (needToUpdateDefaultField) {
                    await this.updateDefaultContent(newContent);
                }

                if (needToUnlinkDefaultField) {
                    delete newContent.linkToDefaultById;
                }
            }

            let needAccessCheck = newContent.type === 'field' && newContent.fieldType === 'task';
            if (needAccessCheck) {
                let mentionedUsers = newContent.task.users;
                mentionedUsers.forEach( user => {
                    let board = this.$store.getters.boardByCard(card);
                    let hasNoAccess = !this.userHasAccess(board, card, user);

                    if (hasNoAccess) {
                        card.guestIds.push(user.id);
                    }
                });
            }

            this.$set(card.content, contentIndex, newContent);

            return this.saveCard(card);
        },
        async deleteContent(contentToDelete, card, deleteLinkedDefault) {
            let contentIndex = card.content.indexOf(contentToDelete);
            this.$delete(card.content, contentIndex);

            if (deleteLinkedDefault) {
                await this.deleteDefaultContent(contentToDelete);
            }

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
        async moveCardToBoard(card, board) {
            let archiveProps = ['blacklist', 'whitelist', 'finishedlist', 'archive', 'deleted'];
            archiveProps.forEach(prop => {
                if (card[prop] === true) {
                    card[prop] = false;
                }
            });

            this.archiveLoading = true;

            let statuses = await this.loadBoardStatuses(board.id);
            let firstStatus = statuses[0];

            card.boardId = board.id;
            card.statusId = firstStatus.id;

            await this.saveCard(card);
            await this.loadArchiveCards(this.archiveType);

            this.archiveLoading = false;
        },
        async deleteCard(card) {
            let response = await axios.get('/api/card/delete', {
                params: {
                    cardId: card.id
                }
            });

            this.currentCard = null;
            this.reloadBoardData();

            return response.data.card;
        },
        async saveCard(cardToSave) {
            let cardIndex = this.cards.findIndex(card => card.id === cardToSave.id);
            if (cardIndex !== -1) {
                this.cards[cardIndex] = cardToSave;
            }

            return axios.post('/api/card/update', cardToSave);
        },
        findCard(cardId) {
            return this.cards.find(card => card.id === cardId) || false;
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
        },
        currentCardTitle() {
            if (!this.currentCard) {
                return false;
            }

            let isDefaultName = /Кандидат \d+/.test(this.currentCard.name);
            let newCardTitle = 'Новый кандидат';
            if (isDefaultName) {
                return newCardTitle;
            }

            return this.currentCard.name || newCardTitle;
        },
        isInvitation() {
            return location.hash.indexOf('invite') !== -1;
        }
    },
    mounted() {
        this.$root.$on('addCard', this.addCard);
        this.$root.$on('deleteCard', this.deleteCard);
        this.$root.$on('selectCard', this.changeCard);
        this.$root.$on('cardInput', this.saveCard);

        this.$root.$on('newContentCard', this.addContentToCard);
        this.$root.$on('updateContent', this.updateContent);
        this.$root.$on('deleteContent', this.deleteContent);

        this.$root.$on('moveCardToNextStatus', this.moveCardToNextStatus);
        this.$root.$on('moveCardToPrevStatus', this.moveCardToPrevStatus);
        this.$root.$on('moveCardToWhiteList', this.moveCardToWhiteList);
        this.$root.$on('moveCardToBlackList', this.moveCardToBlackList);
        this.$root.$on('moveCardToFinishedList', this.moveCardToFinishedList);
        this.$root.$on('moveCardToBoard', this.moveCardToBoard);
    },
    beforeDestroy() {
        this.$root.$off('addCard', this.addCard);
        this.$root.$off('deleteCard', this.deleteCard);
        this.$root.$off('selectCard', this.changeCard);
        this.$root.$off('cardInput', this.saveCard);

        this.$root.$off('newContentCard', this.addContentToCard);
        this.$root.$off('updateContent', this.updateContent);
        this.$root.$off('deleteContent', this.deleteContent);

        this.$root.$off('moveCardToNextStatus', this.moveCardToNextStatus);
        this.$root.$off('moveCardToPrevStatus', this.moveCardToPrevStatus);
        this.$root.$off('moveCardToWhiteList', this.moveCardToWhiteList);
        this.$root.$off('moveCardToBlackList', this.moveCardToBlackList);
        this.$root.$off('moveCardToFinishedList', this.moveCardToFinishedList);
        this.$root.$off('moveCardToBoard', this.moveCardToBoard);
    }
}