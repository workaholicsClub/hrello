import axios from "axios";

function saveBoard(boardId, state) {
    let board = state.boards.find(board => board.id === boardId);
    return axios.post('/api/board/update', board);
}

function saveCard(cardId, state) {
    let card = state.card.cards.find(card => card.id === cardId);
    if (!card) {
        let archive = state.card.archiveCards ? state.card.archiveCards.whitelist || [] : [];
        card = archive.find(card => card.id === cardId);
    }

    return card ? axios.post('/api/card/update', card) : false;
}

function saveUser(state) {
    let user = state.user.currentUser;
    return axios.post('/api/user/update', user);
}

const saveChangesPlugin = store => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'updateBoard') {
            saveBoard(mutation.payload.boardId, state);
        }

        if (mutation.type === 'updateFullBoard') {
            saveBoard(mutation.payload.id, state);
        }

        if (mutation.type === 'updateCard') {
            saveCard(mutation.payload.cardId, state);
        }

        if (mutation.type === 'updateUser') {
            saveUser(state);
        }
    });
}

export default saveChangesPlugin;