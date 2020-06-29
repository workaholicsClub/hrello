import axios from "axios";
import {clone} from "../unsorted/Helpers";

export default {
    data() {
        return {
            currentBoard: false,
            shareBoard: false
        }
    },
    methods: {
        async loadBoards() {
            return this.$store.dispatch('loadBoards', this.userId);
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
            this.showTimetable = false;
            this.showArchive = false;
            this.drawer = false;

            this.$store.commit('deselectCard');

            if (!skipUrlUpdate) {
                this.$router.push({name: 'board', params: {boardId: newBoardId}});
            }
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
        setBoardTitle(newTitle) {
            this.$store.commit('updateBoard', { boardId: this.currentBoard.id, field: 'title', value: newTitle });
        },
        changeBoardType(newType) {
            this.$store.commit('updateBoard', { boardId: this.currentBoard.id, field: 'type', value: newType });
        },
        async deleteBoard(board) {
            await axios.get('/api/board/delete', {
                params: {
                    boardId: board.id
                }
            });

            await this.loadBoards();
            await this.reloadBoardData();
            this.changeBoard( this.boards[0].id );
        },
        async archiveBoard(board) {
            await axios.get('/api/board/archive', {
                params: {
                    boardId: board.id
                }
            });

            await this.loadBoards();
            await this.reloadBoardData();
            this.changeBoard( this.boards[0].id );
        },
        async changeBoardExpandState(newExpandState) {
            this.$store.commit('updateBoard', { boardId: this.currentBoard.id, field: 'expandState', value: newExpandState });
        },
        async changeBoardFilter(newFilter) {
            this.$store.commit('updateBoard', { boardId: this.currentBoard.id, field: 'filterValues', value: newFilter });
        }
    },
    computed: {
        boards() {
            return this.$store.state.boards;
        },
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