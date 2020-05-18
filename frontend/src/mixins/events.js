import axios from "axios";
import shortid from "shortid";

export default {
    data() {
        return {
            timetableEvents: false,
            allEvents: false,
        }
    },
    methods: {
        async loadTimetableEvents() {
            this.$store.dispatch('loadTimetableEvents', {
                userId: this.userId,
                boardIds: this.boardIds
            });
        },
        async addCardlessEvent(newEvent) {
            newEvent.date = new Date();
            newEvent.author = this.user;

            if (this.userId) {
                newEvent.userId = this.userId;
            }

            if (this.currentBoard) {
                newEvent.boardId = this.currentBoard.id;
            }

            await axios.post('/api/event/addCardless', newEvent);
            return await this.loadTimetableEvents();
        },
        async deleteCardlessEvent(eventToDelete) {
            await axios.get('/api/event/deleteCardless', {
                params: {
                    eventId: eventToDelete.id
                }
            });
            return await this.loadTimetableEvents();
        },
        async completeEvent(event) {
            await axios.post('/api/field/update', {
                fieldId: event.id,
                cardId: event.card.id,
                boardId: event.card.boardId,
                changedData: {
                    isComplete: true
                }
            });

            await this.loadAndUpdateBoardCards();
            return await this.loadTimetableEvents();
        },
        async addEventComment(comment, event) {
            comment.id = shortid.generate();
            comment.date = new Date();
            comment.author = this.user;
            comment.version = 1;

            await axios.post('/api/field/add', {
                cardId: event.card.id,
                boardId: event.card.boardId,
                fieldData: comment
            });

            await this.loadAndUpdateBoardCards();
            return await this.loadTimetableEvents();
        },
        async postponeTask(task, date) {
            let postponed = task.postponed || {};
            postponed[this.user.id] = date;

            if (task.isCardless) {
                await axios.post('/api/event/updateCardless', {
                    id: task.id,
                    changedData: {
                        postponed: postponed,
                    }
                });
            }
            else {
                await axios.post('/api/field/update', {
                    fieldId: task.id,
                    cardId: task.card.id,
                    boardId: task.card.boardId,
                    changedData: {
                        postponed: postponed,
                    }
                });
            }

            await this.loadAndUpdateBoardCards();
            return await this.loadTimetableEvents();
        },
        async completeTask(task, user, newState) {
            if (!user) {
                user = this.user;
            }

            if (newState !== false) {
                newState = true;
            }

            let complete = task.complete || {};
            complete[user.id] = newState;

            let changedData = {complete};

            let totallyCompleted = task.author.id === user.id;
            if (totallyCompleted) {
                changedData['value'] = true;
            }

            if (task.isCardless) {
                await axios.post('/api/event/updateCardless', {
                    id: task.id,
                    changedData
                });
            }
            else {
                await axios.post('/api/field/update', {
                    fieldId: task.id,
                    cardId: task.card.id,
                    boardId: task.card.boardId,
                    changedData
                });
            }

            await this.loadAndUpdateBoardCards();
            return await this.loadTimetableEvents();
        }
    },
    mounted() {
        this.$root.$on('addEventComment', this.addEventComment);
        this.$root.$on('completeEvent', this.completeEvent);
        this.$root.$on('newCardlessEvent', this.addCardlessEvent);
        this.$root.$on('deleteCardlessEvent', this.deleteCardlessEvent);
        this.$root.$on('postponeTask', this.postponeTask);
        this.$root.$on('completeTask', this.completeTask);
    },
    beforeDestroy() {
        this.$root.$off('addEventComment', this.addEventComment);
        this.$root.$off('completeEvent', this.completeEvent);
        this.$root.$off('newCardlessEvent', this.addCardlessEvent);
        this.$root.$off('deleteCardlessEvent', this.deleteCardlessEvent);
    }
}
