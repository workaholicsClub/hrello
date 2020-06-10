import axios from "axios";

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
                    return card.boardId === boardId;
                });
            }
        },
        archiveCards(state) {
            return type => state.archiveCards[type];
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
        }
    },
    mutations: {
        setCards(state, newCards) {
            state.cards = newCards;
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
        }
    }
}