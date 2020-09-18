import shortid from "shortid";

export default {
    data() {
        return {

        }
    },
    methods: {
        async updateStatus(changedStatus) {
            return this.$store.dispatch('updateBoardStatus', changedStatus);
        },
        statusTemplate() {
            return {
                id: shortid.generate(),
                boardId: this.currentBoard.id,
                title: 'Новый этап',
                fields: [],
            };
        },
        async addStatus() {
            return this.$store.dispatch('addBoardStatus', {board: this.currentBoard, newStatus: this.statusTemplate()})
        },
        getStatusIndex(targetStatus) {
            return this.statuses.indexOf(targetStatus);
        },
        getNextStatusForStatus(targetStatus) {
            let targetIndex = this.getStatusIndex(targetStatus);
            if (targetIndex === -1) {
                return false;
            }

            if (targetIndex === this.statuses.length-1) {
                return false;
            }

            return this.statuses[targetIndex+1];
        },
        getPreviousStatusForStatus(targetStatus) {
            let targetIndex = this.getStatusIndex(targetStatus);
            if (targetIndex === -1 || targetIndex === 0) {
                return false;
            }

            return this.statuses[targetIndex-1];
        },
        async addStatusLeft(targetStatus) {
            let targetIndex = this.currentBoard.statuses.findIndex(boardStatus => boardStatus.id === targetStatus.id);
            if (targetIndex === -1) {
                targetIndex = this.currentBoard.statuses.length;
            }

            return this.$store.dispatch('addBoardStatusToIndex', {
                board: this.currentBoard,
                newStatus: this.statusTemplate(),
                targetIndex,
            });
        },
        async addStatusRight(targetStatus) {
            let targetIndex = this.currentBoard.statuses.findIndex(boardStatus => boardStatus.id === targetStatus.id);
            if (targetIndex === -1) {
                targetIndex = this.currentBoard.statuses.length-1;
            }

            return this.$store.dispatch('addBoardStatusToIndex', {
                board: this.currentBoard,
                newStatus: this.statusTemplate(),
                targetIndex: targetIndex+1,
            });
        },
        async deleteStatus(status) {
            return this.$store.dispatch('deleteBoardStatus', {status});
        },
    },
    mounted() {
        this.$root.$on('addStatusLeft', this.addStatusLeft);
        this.$root.$on('addStatusRight', this.addStatusRight);
        this.$root.$on('deleteStatus', this.deleteStatus);
        this.$root.$on('updateStatus', this.updateStatus);
    },
    beforeDestroy() {
        this.$root.$off('addStatusLeft', this.addStatusLeft);
        this.$root.$off('addStatusRight', this.addStatusRight);
        this.$root.$off('deleteStatus', this.deleteStatus);
        this.$root.$off('updateStatus', this.updateStatus);
    }
}