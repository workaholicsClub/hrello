import shortid from "shortid";
import axios from "axios";

export default {
    methods: {
        selectFile() {
            this.$refs.fileInput.click();
        },
        async addNewResume() {
            let file = this.$refs.fileInput.files[0];
            let fileId = shortid.generate();
            let userId = this.$store.getters.userId;

            let requestData = new FormData();
            requestData.append('file', file);
            requestData.append('fileId', fileId);
            requestData.append('boardId', this.boardId);
            requestData.append('userId', userId);

            try {
                this.isResumeUploading = true;
                let uploadResult = await axios.post('/api/file/addResume',
                    requestData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                let newCard = uploadResult.data.card;
                newCard.name = newCard.name || '';

                this.$store.commit('updateFullBoard', uploadResult.data.board);
                this.$store.commit('addCards', newCard);
            } catch (e) {
                this.$root.$emit('error', 'Ошибка загрузки файла', e);
            }

            this.isResumeUploading = false;
        },
        enableKeyFocus() {
            document.onkeydown = e => {
                e = e || window.event;
                if (
                    e.key === "/" &&
                    e.target !== this.$refs.searchField.$refs.input
                ) {
                    e.preventDefault();
                    this.$refs.searchField.focus();
                }
            }
        },
        disableKeyFocus() {
            document.onkeydown = null;
        },
        cardText(card) {
            return JSON.stringify(card).toLocaleLowerCase();
        },
        getInitialFilter() {
            let defaultFilter = {
                filterValues: {},
                searchText: '',
            };

            let userHasGroups = this.user && this.user.savedGroups && this.user.savedGroups.length > 0;
            let routeHasGroup = Boolean(this.$route.params.groupId);

            if (!routeHasGroup || !userHasGroups) {
                return defaultFilter;
            }

            let groupId = this.$route.params.groupId;
            let group = this.user.savedGroups.find( savedGroup => savedGroup.id === groupId );

            if (!group) {
                return defaultFilter;
            }

            if (!group.filter) {
                return defaultFilter;
            }

            let clonedFilter = Object.assign({}, group.filter);

            return clonedFilter;
        },
        gotoGroup(group) {
            this.$router.push({name: 'group', params: {groupId: group.id}});
        },
        async handleNewGroup({name}) {
            if (this.filterValues || this.searchText) {
                let filter = {
                    filterValues: this.filterValues,
                    searchText: this.searchText,
                }
                let newGroup = await this.saveGroupToUser(name, filter);
                if (newGroup) {
                    this.gotoGroup(newGroup);
                }
            }
        },
        async saveGroupToUser(name, filter) {
            let savedGroups = this.user && this.user.savedGroups && this.user.savedGroups.length > 0
                ? this.user.savedGroups
                : [];

            let id = shortid.generate();
            let newGroup = {id, name, filter};
            savedGroups.push(newGroup);

            await this.$store.dispatch('updateUserFields', {savedGroups});
            return newGroup;
        }
    },
    computed: {
        boardId() {
            return this.$route.params.boardId;
        },
        hasBoard() {
            return Boolean(this.$route.params.boardId);
        },
        board() {
            return this.$store.getters.boardById(this.boardId);
        },
        groupId() {
            return this.$route.params.groupId;
        },
        hasGroup() {
            return Boolean(this.$route.params.groupId);
        },
        group() {
            return this.$store.getters.savedFilter(this.groupId);
        },
        user() {
            return this.$store.state.user.currentUser;
        },
        statuses() {
            return this.board ? this.board.statuses : [];
        },
        hasStatuses() {
            return this.hasBoard && this.statuses && this.statuses.length > 0;
        },
        cards() {
            return this.hasBoard
                ? this.$store.getters.cardsForBoardId(this.boardId)
                : this.$store.state.card.cards;
        },

    }
}