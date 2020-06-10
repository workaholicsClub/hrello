import axios from "axios";

function saveBoard(boardId, state) {
    let board = state.boards.find(board => board.id === boardId);
    return axios.post('/api/board/update', board);
}


const saveChangesPlugin = store => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'updateBoard') {
            saveBoard(mutation.payload.boardId, state);
        }
    });
}

export default saveChangesPlugin;