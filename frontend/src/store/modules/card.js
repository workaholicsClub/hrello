import axios from "axios";
import rfdc from "rfdc";
const clone = rfdc();
import {getUniqueTags, getCardTags} from "../../unsorted/Helpers";
import md5 from "blueimp-md5";
import moment from "moment";

export default {
    state: {
        currentCard: false,
        cards: [],
        archiveCards: {},
    },
    getters: {
        currentCardId(state) {
            return state.currentCard ? state.currentCard.id : false;
        },
        cardsForBoardId(state) {
            return boardId => {
                if (!boardId) {
                    return [];
                }

                return state.cards.filter( card => {
                    return card && card.boardId === boardId;
                });
            }
        },
        archiveCards(state) {
            return type => state.archiveCards[type];
        },
        cardById(state) {
            return (searchId) => state.cards.find( card => card.id === searchId );
        },
        getAllTags(state) {
            return tagname => {
                let allTags = state.cards.reduce( (tags, card) => {
                    let cardTags = getCardTags(card, tagname);
                    return tags.concat(cardTags);
                }, []);

                return getUniqueTags(allTags).sort( (a, b) => a.text.localeCompare(b.text) );
            }
        },
        getPinnedFieldsWithValues(state, getters) {
            return card => {
                let board = getters.boardByCard(card);
                if (!board) {
                    return [];
                }

                let activePinnedFields = getters.activePinnedFields(board);

                return activePinnedFields.map( pinnedField => {
                    let value = card.pinnedFieldValues
                        ? card.pinnedFieldValues.find( fieldValue => fieldValue.fieldName === pinnedField.name )
                        : {value: ''};

                    return Object.assign(pinnedField, value);
                });
            }
        },
        getCandidateAvatarUrl() {
            return card => {
                let links = card.pinnedFieldValues
                    ? card.pinnedFieldValues.map(fieldValue => fieldValue.value).filter( value => Boolean(value && value.toString().match(/https*:\/\//i)) )
                    : [];

                let emails = card.pinnedFieldValues
                    ? card.pinnedFieldValues.map(fieldValue => fieldValue.value).filter( value => Boolean(value && value.toString().match(/.*?@.*?\..*?/i)) )
                    : [];

                let files = card.content
                    ? card.content
                        .filter( content => content.fieldType === 'file' || typeof (content.file) !== 'undefined')
                        .map(content => {
                            let file = content.file;
                            file.fileName = content.uploadData.downloadUrl.replace(/^.*\//, '');
                            return file;
                        })
                    : [];

                let facebookLink = links.filter( link => link.indexOf('facebook') !== -1 );
                let vkLink = links.filter( link => link.indexOf('vk.com') !== -1 );

                let hasFiles = files && files.length > 0;
                let hasSocialLinks = (facebookLink && facebookLink.length > 0) || (vkLink && vkLink.length > 0);
                let canGetAvatarFromCard = hasFiles || hasSocialLinks;

                if (canGetAvatarFromCard) {
                    return `/api/file/resumeAvatar?cardId=${card.id}`;
                }

                if (emails && emails[0]) {
                    let hash = md5(emails[0].toLocaleLowerCase());
                    return `https://www.gravatar.com/avatar/${hash}.jpg?d=identicon`;
                }

                return false;
            }
        },
        nextCardStatus(state, getters) {
            return card => {
                let board = getters.boardByCard(card);
                let currentStatusIndex = board.statuses.findIndex(status => status.id === card.statusId);
                if (currentStatusIndex !== -1) {
                    let nextIndex = currentStatusIndex < board.statuses.length - 1
                        ? currentStatusIndex + 1
                        : false;

                    return nextIndex
                        ? board.statuses[nextIndex]
                        : false;
                }

                return false;
            }
        },
        previousCardStatus(state, getters) {
            return card => {
                let board = getters.boardByCard(card);
                let currentStatusIndex = board.statuses.findIndex(status => status.id === card.statusId);
                if (currentStatusIndex !== -1) {
                    let prevIndex = currentStatusIndex > 0
                        ? currentStatusIndex - 1
                        : false;

                    return prevIndex !== false
                        ? board.statuses[prevIndex]
                        : false;
                }

                return false;
            }
        },
        timeInCurrentStatus() {
            return card => {
                let historyRecord = card.statusHistory
                    ? card.statusHistory[ card.statusHistory.length - 1 ]
                    : false;

                let startInStatus = historyRecord
                    ? moment(historyRecord.dateChanged)
                    : moment(card.lastUpdated);

                let today = moment();

                return moment.duration(today.diff(startInStatus)).as('seconds');
            }
        },
        overTime(state, getters) {
            return (card, fieldName) => {
                let board = getters.boardByCard(card);
                let boardHasTimeStats = board && board.stats && board.stats.time;

                if (!boardHasTimeStats) {
                    return 0;
                }

                let statusStats = board.stats.time.find( statItem => statItem.statusId === card.statusId );
                let timeInCurrentStatus = getters.timeInCurrentStatus(card);

                if (statusStats && statusStats[fieldName]) {
                    let minimalCardsForNormalStatistics = 10;
                    if (statusStats.totalCardsWithTime < minimalCardsForNormalStatistics) {
                        return 0;
                    }

                    return timeInCurrentStatus - statusStats[fieldName] > 0
                        ? timeInCurrentStatus - statusStats[fieldName]
                        : 0;
                }

                return 0;
            }
        },
        getOvertimeCards(state, getters) {
            return state.cards
                ? state.cards.filter( card => getters.overTime(card, 'overTime') > 0 )
                : [];
        }
    },
    actions: {
        async loadCards({commit}, userId) {
            let response = await axios.get(`/api/card/listAll`, {
                params: {userId}
            });

            commit('setCards', response.data.card);
        },
        async loadArchiveCards({commit, getters}, type) {

            let cardsResponse = await axios.get('/api/card/listArchive', {
                params: {
                    userId: getters.userId,
                    archiveType: type,
                }
            });

            commit('setArchiveCards', {archiveCards: cardsResponse.data.card, type});
        },
        updatePinnedValue({commit, rootState}, {card, field, value}) {
            let updatedCard = clone(card);
            if (!updatedCard.pinnedFieldValues) {
                updatedCard.pinnedFieldValues = [];
            }

            let currentValue = updatedCard.pinnedFieldValues.find(value => value.fieldId === field.id );
            if (currentValue) {
                let valueIndex = updatedCard.pinnedFieldValues.indexOf(currentValue);
                let newValue = Object.assign(currentValue, {value});
                updatedCard.pinnedFieldValues[valueIndex] = newValue;
            }
            else {
                let defaultValue = {
                    fieldId: field.id,
                    fieldName: field.name,
                    author: rootState.user.currentUser,
                }

                let newValue = Object.assign(defaultValue, {value});
                updatedCard.pinnedFieldValues.push(newValue);
            }

            commit('updateCard', {cardId: updatedCard.id, fields: updatedCard});
        }
    },
    mutations: {
        setCards(state, newCards) {
            state.cards = newCards;
        },
        addCards(state, newCards) {
            if (newCards instanceof Array) {
                state.cards = state.cards.concat(newCards);
            }
            else {
                state.cards.push(newCards);
            }
        },
        setArchiveCards(state, {archiveCards, type}) {
            this._vm.$set(state.archiveCards, type, archiveCards);
        },
        deselectCard(state) {
            state.currentCard = false;
        },
        selectCard(state, newCard) {
            state.currentCard = newCard;
        },
        selectCardById(state, newCardId) {
            let newCard = state.cards.find( card => card.id === newCardId );

            if (newCard) {
                state.currentCard = newCard;
            }
        },
        updateCard(state, {cardId, fields}) {
            let cardIndex = state.cards.findIndex( cards => cards.id === cardId );
            if (cardIndex !== -1) {
                this._vm.$set(state.cards, cardIndex, fields);
            }

            if (state.currentCard.id === cardId) {
                state.currentCard = fields;
            }
        }
    }
}