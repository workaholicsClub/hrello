import axios from "axios";

export default {
    data() {
        return {
            globalEvents: [],
            timetableEvents: false,
        }
    },
    methods: {
        async loadGlobalEvents() {
            this.globalEvents = await this.loadGlobalObject('event');
        },
        async loadTimetableEvents() {
            let eventsResponse = await axios.get('/api/event/listTimetable', {
                params: {
                    userId: this.userId,
                    boardIds: this.boardIds
                }
            });
            this.timetableEvents = eventsResponse.data.groupedEvents;
        },

        findGlobalEvent(eventId) {
            let foundEvents = this.globalEvents.filter(event => event.id === eventId);
            return foundEvents.length > 0 ? foundEvents[0] : false;
        },
        addEvent(newEvent, apiMethodName) {
            newEvent.date = new Date();
            newEvent.author = this.user;

            if (this.userId) {
                newEvent.userId = this.userId;
            }

            if (this.currentBoard) {
                newEvent.boardId = this.currentBoard.id;
            }

            return axios.post('/api/event/'+apiMethodName, newEvent);
        },
        async addGlobalEvent(newEvent) {
            let response = await this.addEvent(newEvent, 'addGlobal');
            this.globalEvents = response.data.events;

            return response;
        },
        async addCardlessEvent(newEvent) {
            await this.addEvent(newEvent, 'addCardless');
            return await this.loadTimetableEvents();
        },
    },
    mounted() {
        this.$root.$on('updateGlobalEvent', this.updateGlobalValue);

        this.$root.$on('newGlobalEvent', this.addGlobalEvent);
        this.$root.$on('newCardlessEvent', this.addCardlessEvent);
    },
    beforeDestroy() {
        this.$root.$off('updateGlobalEvent', this.updateGlobalValue);

        this.$root.$off('newGlobalEvent', this.addGlobalEvent);
        this.$root.$off('newCardlessEvent', this.addCardlessEvent);
    }
}
