import axios from "axios";
import {clone} from "../unsorted/Helpers";

export default {
    data() {
        return {
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
        async addNewBoard(boardFields) {
            let nextBoardNumber = this.boards.length + 1;
            let boardTemplate = {
                title: 'Вакансия ' + nextBoardNumber,
                dateCreated: (new Date).toString(),
                userId: this.userId,
                workspace: this.user.workspace || false,
                show: {
                    info: true,
                    hashtags: true,
                    achievements: true,
                    buttons: true,
                }
            };

            if (boardFields) {
                boardFields = Object.assign(boardTemplate, boardFields)
            }
            else {
                boardFields = boardTemplate;
            }

            let boardResponse = await axios.post('/api/board/add', boardFields);

            if (boardResponse.data.board) {
                this.$store.commit('addBoard', boardResponse.data.board);
            }

            if (boardResponse.data.card) {
                this.$store.commit('addCards', boardResponse.data.card);
            }
            this.changeBoard(boardResponse.data.board.id);
        },
        async copyBoard(srcBoard) {
            let newBoard = clone(srcBoard);
            newBoard.userId = this.user.id;
            let boardResponse = await axios.post('/api/board/copy', newBoard);
            this.$store.commit('addBoard', boardResponse.data.board);
            this.$router.push({name: 'vacancy', params: {boardId: boardResponse.data.board.id}});
        },
        setBoardTitle(newTitle) {
            this.$store.commit('updateBoard', { boardId: this.currentBoard.id, field: 'title', value: newTitle });
        },
        changeBoardType(newType, board) {
            if (!board) {
                board = this.currentBoard;
            }
            this.$store.commit('updateBoard', { boardId: board.id, field: 'type', value: newType });
        },
        async deleteBoard(board) {
            await axios.get('/api/board/delete', {
                params: {
                    boardId: board.id
                }
            });

            this.$router.push({name: 'home'});
            await this.loadBoards();
            await this.reloadBoardData();
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
            return this.$route.params.boardId;
        },
        boardIds() {
            return this.boards.map(board => board.id);
        },
        hasNoBoards() {
            return this.boards.length === 0;
        },
        currentBoard() {
            return this.$store.getters.boardById(this.currentBoardId);
        },
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