import axios from "axios";

export default {
    data() {
        return {
            timetableEvents: false,
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
    },
    mounted() {
        this.$root.$on('newCardlessEvent', this.addCardlessEvent);
        this.$root.$on('deleteCardlessEvent', this.deleteCardlessEvent);
    },
    beforeDestroy() {
        this.$root.$off('newCardlessEvent', this.addCardlessEvent);
        this.$root.$off('deleteCardlessEvent', this.deleteCardlessEvent);
    }
}
