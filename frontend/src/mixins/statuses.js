import axios from "axios";

export default {
    data() {
        return {

        }
    },
    methods: {
        async updateStatus(changedStatus) {
            return await axios.post('/api/status/update', changedStatus);
        },
        async addStatus(sortIndex) {
            if (typeof(sortIndex) !== 'number') {
                sortIndex = 100;
            }

            let newStatusTemplate = {
                boardId: this.currentBoard.id,
                sort: sortIndex,
                title: 'Новый статус',
                fields: [],
            };
            await axios.post('/api/status/add', newStatusTemplate);

            return await this.loadAndUpdateBoardStatuses();
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
            let newSortIndex = targetStatus.sort - 100;
            let previousStatus = this.getPreviousStatusForStatus(targetStatus);

            if (previousStatus) {
                newSortIndex = Math.round( (previousStatus.sort + targetStatus.sort)/2 );
            }

            return await this.addStatus(newSortIndex);
        },
        async addStatusRight(targetStatus) {
            let newSortIndex = targetStatus.sort + 100;
            let nextStatus = this.getNextStatusForStatus(targetStatus);

            if (nextStatus) {
                newSortIndex = Math.round( (nextStatus.sort + targetStatus.sort)/2 );
            }

            return await this.addStatus(newSortIndex);
        },
        async deleteStatus(targetStatus) {
            let statusIndex = this.getStatusIndex(targetStatus);
            if (statusIndex !== -1) {
                let archivedStatus = this.statuses.splice(statusIndex, 1)[0];
                return await axios.get('/api/status/delete', {
                    params: {
                        statusId: archivedStatus.id
                    }
                });
            }

            return false;
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