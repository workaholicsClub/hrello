import axios from "axios";
import shortid from "shortid";
import {clone} from "../unsorted/Helpers";
import moment from "moment";

export default {
    data() {
        return {
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
        async loadCards() {
            return this.$store.dispatch('loadCards', this.userId);
        },
        async loadAndUpdateBoardCards() {
            return this.$store.dispatch('loadCards', this.userId);
        },
        async loadArchiveCards(type) {
            this.$store.dispatch('loadArchiveCards', type);
        },
        async changeCard(newCardId) {
            let foundCard = this.findCard(newCardId);

            if (!foundCard) {
                foundCard = await this.loadCard(newCardId);
            }

            if (foundCard) {
                this.$store.commit('selectCard', foundCard);

                try {
                    let board = this.$store.getters.boardByCard(foundCard);
                    await this.$router.push({name: 'card', params: {boardId: board.id, cardId: newCardId}});
                }
                catch (error) {
                    return false;
                }
            }
        },
        async addCard(status) {
            let newCard = {
                author: this.$store.state.user.currentUser,
                lastUpdatedBy: this.$store.state.user.currentUser,
                created: moment().toISOString(),
                lastUpdated: moment().toISOString(),
                statusId: status.id,
                statusHistory: [
                    { statusId: status.id, prevStatusId: false, dateChanged: moment().toISOString() },
                ],
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

            this.$store.commit('addCards', createdCard);
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

            if (contentIndex === -1) {
                contentIndex = card.content.findIndex( content => content.id === oldContent.id );
            }

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
        async moveCardToStatus(card, status) {
            if (status) {
                let oldStatusId = card.statusId;
                card.statusId = status.id;

                if (!card.statusHistory) {
                    card.statusHistory = [];
                }

                card.statusHistory.push({
                    statusId: status.id,
                    prevStatusId: oldStatusId,
                    dateChanged: moment().toISOString()
                });

                return this.saveCard(card);
            }
        },
        async moveCardToNextStatus(card) {
            let nextStatus = this.getNextStatusForCard(card);
            return this.moveCardToStatus(card, nextStatus);
        },
        async moveCardToPrevStatus(card) {
            let previousStatus = this.getPreviousStatusForCard(card);
            return this.moveCardToStatus(card, previousStatus);
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
            await this.loadCards();
            await this.loadArchiveCards(this.archiveType);

            this.archiveLoading = false;
        },
        async deleteCard(card) {
            let response = await axios.get('/api/card/delete', {
                params: {
                    cardId: card.id
                }
            });

            this.$store.commit('deselectCard');
            this.reloadBoardData();

            return response.data.card;
        },
        async saveCard(cardToSave) {
            cardToSave.lastUpdated = moment().toISOString();
            cardToSave.lastUpdatedBy = this.$store.state.user.currentUser;

            return this.$store.commit('updateCard', {cardId: cardToSave.id, fields: cardToSave});
        },
        findCard(cardId) {
            return this.cards.find(card => card.id === cardId) || false;
        },
        getNextStatusForCard(card) {
            return this.$store.getters.nextCardStatus(card);
        },
        getPreviousStatusForCard(card) {
            return this.$store.getters.previousCardStatus(card);
        },
    },
    computed: {
        cards() {
            return this.$store.getters.cardsForBoardId(this.currentBoardId);
        },
        currentCard() {
            return this.$store.state.card.currentCard;
        },
        currentCardId() {
            return this.currentCard ? this.currentCard.id : false;
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

        this.$root.$on('moveCardToStatus', this.moveCardToStatus);
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

        this.$root.$off('moveCardToStatus', this.moveCardToStatus);
        this.$root.$off('moveCardToNextStatus', this.moveCardToNextStatus);
        this.$root.$off('moveCardToPrevStatus', this.moveCardToPrevStatus);
        this.$root.$off('moveCardToWhiteList', this.moveCardToWhiteList);
        this.$root.$off('moveCardToBlackList', this.moveCardToBlackList);
        this.$root.$off('moveCardToFinishedList', this.moveCardToFinishedList);
        this.$root.$off('moveCardToBoard', this.moveCardToBoard);
    }
}