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
            let eventsResponse = await axios.get('/api/event/listTimetable', {
                params: {
                    userId: this.userId,
                    boardIds: this.boardIds
                }
            });
            this.timetableEvents = eventsResponse.data.groupedEvents;
            this.allEvents = eventsResponse.data.events;
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
        }
    },
    mounted() {
        this.$root.$on('addEventComment', this.addEventComment);
        this.$root.$on('completeEvent', this.completeEvent);
        this.$root.$on('newCardlessEvent', this.addCardlessEvent);
        this.$root.$on('deleteCardlessEvent', this.deleteCardlessEvent);
    },
    beforeDestroy() {
        this.$root.$off('addEventComment', this.addEventComment);
        this.$root.$off('completeEvent', this.completeEvent);
        this.$root.$off('newCardlessEvent', this.addCardlessEvent);
        this.$root.$off('deleteCardlessEvent', this.deleteCardlessEvent);
    }
}
