import axios from "axios";
import {clone} from "../unsorted/Helpers";

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
        async copyBoard(srcBoard) {
            let newBoard = clone(srcBoard);
            newBoard.userId = this.user.id;
            let boardResponse = await axios.post('/api/board/copy', newBoard);
            this.statuses = boardResponse.data.status;
            this.currentBoard = boardResponse.data.board;
            this.boards.push(this.currentBoard);
        },
        updateVacancyText(newVacancyText) {
            this.currentBoard.vacancyText = newVacancyText;
            this.saveCurrentBoard();
        },
        saveCurrentBoard() {
            axios.post('/api/board/update', this.currentBoard);
        },
        setBoardTitle(newTitle) {
            this.currentBoard.title = newTitle;
            this.saveCurrentBoard();
        },
        changeBoardType(newType) {
            this.currentBoard.type = newType;
            this.saveCurrentBoard();
        },
        async deleteBoard(board) {
            await axios.get('/api/board/delete', {
                params: {
                    boardId: board.id
                }
            });

            await this.loadBoards();
            await this.reloadBoardData();
            this.currentBoard = this.boards[0];
        },
        async archiveBoard(board) {
            await axios.get('/api/board/archive', {
                params: {
                    boardId: board.id
                }
            });

            await this.loadBoards();
            await this.reloadBoardData();
            this.currentBoard = this.boards[0];
        },
        async changeBoardExpandState(newExpandState) {
            this.currentBoard.expandState = newExpandState;
            this.saveCurrentBoard();
        },
        async changeBoardFilter(newFilter) {
            this.currentBoard.filterValues = newFilter;
            this.saveCurrentBoard();
        }
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
            return this.currentBoard && !this.showTimetable && !this.currentCard && !this.showArchive && !this.showVacancyEditor;
        },
        hasNoBoards() {
            return this.boards.length === 0;
        }
    },
    mounted() {
        this.$root.$on('newBoard', this.addNewBoard);
        this.$root.$on('archiveBoard', this.archiveBoard);
        this.$root.$on('deleteBoard', this.deleteBoard);
        this.$root.$on('copyBoard', this.copyBoard);
        this.$root.$on('changeBoardType', this.changeBoardType);
        this.$root.$on('expandBoardFilter', this.changeBoardExpandState);
        this.$root.$on('filterBoard', this.changeBoardFilter);
    },
    beforeDestroy() {
        this.$root.$off('newBoard', this.addNewBoard);
        this.$root.$off('archiveBoard', this.archiveBoard);
        this.$root.$off('deleteBoard', this.deleteBoard);
        this.$root.$off('copyBoard', this.copyBoard);
        this.$root.$off('changeBoardType', this.changeBoardType);
        this.$root.$off('expandBoardFilter', this.changeBoardExpandState);
        this.$root.$off('filterBoard', this.changeBoardFilter);
    }
}