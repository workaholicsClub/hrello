<template>
    <v-content class="full-height">
        <v-container class="full-height px-sm-4 align-items-start py-0" fluid >
            <v-row no-gutters class="flex-column-reverse flex-md-row">
                <v-col md="7" cols="12">
                    <v-row class="day-row px-sm-4 py-sm-4" v-for="(events, dateText) in filteredEvents" :key="dateText"
                        :class="{'old': isOldFormattedDate(dateText)}"
                    >
                        <v-col md="3" cols="12" class="pr-4 py-0">
                            <h6>
                                {{dayName(dateText)}}
                            </h6>
                            <h2>
                                {{humanDate(dateText)}}
                            </h2>
                        </v-col>
                        <v-col md="9" cols="12" class="py-0">
                            <v-alert type="success" outlined text v-if="events.length === 0">Событий нет</v-alert>
                            <timetable-event-card v-for="event in events" :key="event.id" :event="event" :user="user"></timetable-event-card>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col md="5" cols="12" class="py-4">
                    <v-date-picker
                        :events="calendarEvents"
                        v-model="selectedDate_YYYYMMDD"
                        locale="ru"
                        first-day-of-week="1"
                        no-title
                        full-width
                        fixed
                    ></v-date-picker>
                </v-col>

            </v-row>

            <v-dialog v-model="showNewEventForm" persistent max-width="600px">
                <template v-slot:activator="{ on }">
                    <v-btn fab class="pink darken-1" fixed bottom right dark v-on="on">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <v-select
                                :items="['Новое событие', 'Новая задача']"
                                solo
                                v-model="formTitle"
                        ></v-select>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <edit-task v-model="newTask" class="pb-4" v-if="isNewTask"></edit-task>
                            <edit-event v-model="newEvent" :skip-global-switch="true" class="pb-4" v-else></edit-event>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text @click="toggleNewEventForm">Отмена</v-btn>
                        <v-btn color="pink darken-1" dark @click="sendSaveEventEvent">Добавить</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-container>
    </v-content>
</template>

<script>
    import moment from "moment";
    import EditEvent from "./Fields/Edit/Event";
    import EditTask from "./Fields/Edit/Field";
    import TimetableEventCard from "./TimetableEventCard";

    export default {
        name: "Timetable",
        props: ['isDesktop', 'user'],
        components: {
            EditEvent,
            EditTask,
            TimetableEventCard
        },
        data() {
            return {
                allEvents: this.$store.state.timetableEvents,
                formTitle: 'Новое событие',
                showNewEventForm: false,
                newEvent: null,
                newTask: null,
                selectedDate_YYYYMMDD: moment().format('YYYY-MM-DD'),
            }
        },
        methods: {
            isOldFormattedDate(formattedDate) {
                return moment(formattedDate, "DD.MM.YYYY")
                        .set({hour: 23, minute: 59, second: 59})
                        .isBefore( moment.now() );
            },
            dayName(formattedDate) {
                return moment(formattedDate,"DD.MM.YYYY").format('dddd');
            },
            humanDate(formattedDate) {
                return moment(formattedDate,"DD.MM.YYYY").format('D MMM').replace('.', '');
            },
            toggleNewEventForm() {
                this.showNewEventForm = !this.showNewEventForm;
            },
            resetEvent() {
                this.newEvent = {
                    type: 'event',
                    name: null,
                    value: null,
                    isCardless: true
                };
            },
            resetTask() {
                this.newTask = {
                    type: 'field',
                    fieldType: 'task',
                    value: null,
                    isCardless: true,
                };
            },
            sendSaveEventEvent() {
                this.$root.$emit('newCardlessEvent', this.isNewTask ? this.newTask : this.newEvent);
                this.resetEvent();
                this.resetTask();
                this.showNewEventForm = false;
            },
            changeDate(newDate) {
                this.selectedDate = newDate.date;
            }
        },
        computed: {
            isNewTask() {
                return this.formTitle === 'Новая задача';
            },
            calendarEvents() {
                return this.$store.getters.eventDatesForUser(this.user.id);
            },
            filteredEvents() {
                let searchDate = moment(this.selectedDate_YYYYMMDD, 'YYYY-MM-DD');
                let reformattedDate = searchDate.format('DD.MM.YYYY');
                let events = this.$store.getters.eventsByDateForUser(searchDate, this.user.id);

                let oneDayEvents = {};
                oneDayEvents[reformattedDate] = events || [];

                return oneDayEvents;
            }
        },
        created() {
            this.resetEvent();
            this.resetTask();
        }
    }
</script>

<style scoped>
    /*.old {*/
    /*    opacity: 0.3;*/
    /*    filter: blur(1px);*/
    /*}*/

    .event-card:not(.old) {
        cursor: pointer;
    }

    .v-calendar {
        max-height: 350px;
    }
</style>
<style>
    .v-content.full-height,
    .v-content.full-height .v-content__wrap {
        height: 100%;
    }

    .new-cardless-event-form .row {
        flex-direction: column!important;
    }
</style>