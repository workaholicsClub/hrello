import axios from "axios";

export default {
    data() {
        return {
            currentBoardId: false,
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
        changeBoard(newBoardId, skipUrlUpdate) {
            this.currentBoardId = newBoardId;
            this.currentCard = false;
            this.showTimetable = false;
            this.drawer = false;

            this.loadGlobalEvents();
            this.loadGlobalFields();

            if (!skipUrlUpdate) {
                this.updateUrl();
            }
        },
        reloadBoardData() {
            this.loadBoardStatuses();
            this.loadBoardCards();
        },
        resetBoards() {
            this.boards = [];
            this.currentBoardId = false;
            this.currentCard = false;
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
            this.boards.push(boardResponse.data.board);
            this.currentBoardId = boardResponse.data.board.id;
            this.updateUrl();
        },
        saveCurrentBoard() {
            axios.post('/api/board/update', this.currentBoard);
        },
        setBoardTitle(newTitle) {
            this.currentBoard.title = newTitle;
            this.saveCurrentBoard();
        }
    },
    computed: {
        currentBoard() {
            if (!this.currentBoardId || !this.boards) {
                return false;
            }

            let foundBoards = this.boards.filter(board => board.id === this.currentBoardId);
            return foundBoards.length > 0 ? foundBoards[0] : false;
        },
        boardIds() {
            return this.boards.map(board => board.id);
        },
        isBoardShown() {
            return this.currentBoardId && !this.showTimetable && !this.currentCard;
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