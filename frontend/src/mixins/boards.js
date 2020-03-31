import axios from "axios";

export default {
    data() {
        return {
            currentBoard: false,
            shareBoard: false,

            boards: [],
        }
    },
    methods: {
        async loadBoards() {
            if (!this.userId) {
                return [];
            }

            let response = await axios.get('/api/board/list', {
                params: {
                    userId: this.userId
                }
            });
            this.boards = response.data.board;
        },
        findBoard(searchId) {
            if (!searchId || !this.boards) {
                return false;
            }

            let foundBoard = this.boards.find(board => board.id === searchId);
            return foundBoard || false;
        },
        changeBoard(newBoardId, skipUrlUpdate) {
            this.currentBoard = this.findBoard(newBoardId);
            this.currentCard = false;
            this.showTimetable = false;
            this.showArchive = false;
            this.drawer = false;

            if (!skipUrlUpdate) {
                this.updateUrl();
            }

            this.reloadBoardData();
        },
        reloadBoardData() {
            this.loadAndUpdateBoardStatuses();
            this.loadAndUpdateBoardCards();
        },
        resetBoards() {
            this.boards = [];
            this.currentBoard = false;
            this.currentCard = false;
            this.showArchive = false;
            this.updateUrl();
        },
        async addNewBoard() {
            let nextBoardNumber = this.boards.length + 1;
            let boardTemplate = {
                title: 'Доска ' + nextBoardNumber,
                userId: this.userId
            };

            let boardResponse = await axios.post('/api/board/add', boardTemplate);
            this.statuses = boardResponse.data.status;
            this.currentBoard = boardResponse.data.board;
            this.boards.push(this.currentBoard);
            this.updateUrl();
        },
        saveCurrentBoard() {
            axios.post('/api/board/update', this.currentBoard);
        },
        setBoardTitle(newTitle) {
            this.currentBoard.title = newTitle;
            this.saveCurrentBoard();
        },
        async deleteBoard(boardId) {
            return await axios.get('/api/board/delete', {
                params: {
                    boardId: boardId
                }
            });
        },
    },
    computed: {
        currentBoardId() {
            return this.currentBoard
                ? this.currentBoard.id || false
                : false;
        },
        boardIds() {
            return this.boards.map(board => board.id);
        },
        isBoardShown() {
            return this.currentBoard && !this.showTimetable && !this.currentCard && !this.showArchive;
        },
        hasNoBoards() {
            return this.boards.length === 0;
        }
    },
    mounted() {
        this.$root.$on('newBoard', this.addNewBoard);
    },
    beforeDestroy() {
        this.$root.$off('newBoard', this.addNewBoard);
    }
}