<template>
    <v-main class="full-height timetable">
        <v-container class="full-height px-sm-4 align-items-start py-0" fluid >
            <v-row no-gutters class="flex-column-reverse flex-md-row py-2">
                <v-col md="8" cols="12">

                    <v-expansion-panels flat multiple :value="openedPanels">
                        <v-expansion-panel v-for="group in groups" :key="group.title">
                            <v-expansion-panel-header><h2>{{group.title}} <span class="event-count ml-2">{{group.getter().length}}</span></h2></v-expansion-panel-header>
                            <v-expansion-panel-content>
                                <v-alert type="success" outlined text v-if="group.getter().length === 0">Дел нет</v-alert>
                                <v-row v-for="event in group.getter()" :key="event.id">
                                    <v-col md="1" cols="12" class="time">
                                        {{group.useCards ? '' : eventTime(event)}}
                                    </v-col>
                                    <v-col md="11" cols="12">
                                        <card v-if="group.useCards"
                                                :card="event"
                                                :show-comment-override="true"
                                                :show-avatar="false"
                                                :show-board="true"
                                        ></card>
                                        <card v-else-if="event.card && eventIndex(event) !== false"
                                                :card="eventCard(event)"
                                                :comment-index="eventIndex(event)"
                                                :show-comment-override="true"
                                                :show-avatar="false"
                                                :show-board="true"
                                        >
                                            <template v-slot:footer>
                                                <div class="d-flex flex-row justify-content-between footer-buttons mt-4">
                                                    <v-btn depressed rounded
                                                            class="mr-2"
                                                            color="success"
                                                            @click.stop="completeTask(event, user)"
                                                    >Готово</v-btn>
                                                    <v-menu offset-y>
                                                        <template v-slot:activator="{ on }">
                                                            <v-btn class="" color="secondary" outlined rounded v-on="on">Отложить</v-btn>
                                                        </template>
                                                        <v-list class="postpone-menu" v-if="group.isCurrent">
                                                            <v-list-item @click="postponeTask(event, 'tomorrow')"><v-list-item-title>До завтра</v-list-item-title></v-list-item>
                                                            <v-list-item @click="postponeTask(event, '2days')"><v-list-item-title>На два дня</v-list-item-title></v-list-item>
                                                            <v-list-item @click="postponeTask(event, 'nextWeek')"><v-list-item-title>До следующей недели</v-list-item-title></v-list-item>
                                                        </v-list>
                                                        <v-list class="postpone-menu" v-else>
                                                            <v-list-item @click="postponeTask(event, '1day')"><v-list-item-title>На один день</v-list-item-title></v-list-item>
                                                            <v-list-item @click="postponeTask(event, '2days')"><v-list-item-title>На два дня</v-list-item-title></v-list-item>
                                                            <v-list-item @click="postponeTask(event, 'oneWeek')"><v-list-item-title>На неделю</v-list-item-title></v-list-item>
                                                        </v-list>
                                                    </v-menu>
                                                </div>
                                            </template>
                                        </card>
                                        <timetable-event-card v-else :event="event" :user="user"></timetable-event-card>
                                    </v-col>
                                </v-row>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>

                </v-col>
                <v-col md="4" cols="12">
                    <v-row class="day-row px-sm-4">
                        <v-col>
                            <h6>
                                {{dayName(selectedDate_YYYYMMDD)}}
                            </h6>
                            <h2>
                                {{humanDate(selectedDate_YYYYMMDD)}}
                            </h2>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-date-picker
                                    :events="calendarEvents"
                                    elevation="2"
                                    v-model="selectedDate_YYYYMMDD"
                                    locale="ru"
                                    first-day-of-week="1"
                                    no-title
                                    full-width
                                    fixed
                            ></v-date-picker>
                        </v-col>
                    </v-row>
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
    </v-main>
</template>

<script>
    import moment from "moment";
    import EditEvent from "./Fields/Edit/Event";
    import EditTask from "./Fields/Edit/Field";
    import TimetableEventCard from "./TimetableEventCard";
    import Card from "./Card";

    export default {
        name: "Timetable",
        components: {
            EditEvent,
            EditTask,
            TimetableEventCard,
            Card
        },
        data() {
            return {
                allEvents: this.$store.state.timetableEvents,
                formTitle: 'Новое событие',
                showNewEventForm: false,
                newEvent: null,
                newTask: null,
                selectedDate_YYYYMMDD: moment().format('YYYY-MM-DD'),
                openedPanels: [1],
                groups: [
                    {title: 'Старые', getter: () => this.oldEvents, hasIndicator: false, isCurrent: false, useCards: false},
                    {title: 'Просроченные', getter: () => this.overTimeCards, hasIndicator: true, isCurrent: false, useCards: true},
                    {title: 'Дела на сегодня', getter: () => this.todayEvents, hasIndicator: true, isCurrent: true, useCards: false},
                    {title: 'Можно поделать еще', getter: () => this.futureEvents, hasIndicator: false, isCurrent: false, useCards: false},
                ],
            }
        },
        methods: {
            eventCard(event) {
                return this.$store.getters.cardById(event.card.id);
            },
            eventIndex(event) {
                let card = this.eventCard(event);
                let eventIndex = card.content
                    ? card.content.findIndex(content => content.id === event.id)
                    : false;
                return eventIndex !== -1 ? eventIndex : false;
            },
            isOldFormattedDate(formattedDate) {
                return moment(formattedDate, "DD.MM.YYYY")
                        .set({hour: 23, minute: 59, second: 59})
                        .isBefore( moment.now() );
            },
            dayName(formattedDate) {
                return moment(formattedDate,"YYYY-MM-DD").format('dddd');
            },
            humanDate(formattedDate) {
                return moment(formattedDate,"YYYY-MM-DD").format('D MMM').replace('.', '');
            },
            eventDate(event) {
                if (event.postponed && event.postponed[this.user.id]) {
                    let postponedDate = event.postponed[this.user.id];
                    return moment(postponedDate);
                }

                let isoDate = event.data && event.data.dates
                    ? event.data.dates[0]
                    : event.value;

                return moment(isoDate);
            },
            eventTime(event) {
                let isoDate = this.eventDate(event);
                return moment(isoDate).format('HH:mm');
            },
            sortEvents(events) {
                let sortedEvents = events.slice();

                sortedEvents.sort( (a, b) => {
                    let dateA = this.eventDate(a);
                    let dateB = this.eventDate(b);
                    return dateA.isBefore(dateB)
                        ? -1
                        : (dateA.isSame(dateB) ? 0 : 1);
                });

                return sortedEvents;
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
            },
            refreshEvents() {
                this.$store.dispatch('loadTimetableEvents');
            },
            postponeTask(item, postponeCode) {
                let postponeDate = item.postponed && item.postponed[this.user.id]
                    ? moment(item.postponed[this.user.id])
                    : moment();
                let today = moment();

                switch (postponeCode) {
                    case 'tomorrow':
                        postponeDate = today.clone().add(1, 'day');
                        break;
                    case '1day':
                        postponeDate = postponeDate.add(1, 'day');
                        break;
                    case '2days':
                        postponeDate = postponeDate.add(2, 'day');
                        break;
                    case 'oneWeek':
                        postponeDate = today.clone().add(1, 'week');
                        break;
                    case 'nextWeek':
                        postponeDate = postponeDate.add(1, 'week').startOf('week');
                        break;
                }

                this.$root.$emit('postponeTask', item, postponeDate.toDate());
            },
            completeTask(item, user) {
                this.$root.$emit('completeTask', item, user);
            },
        },
        computed: {
            isDesktop() {
                return this.$isDesktop();
            },
            user() {
                return this.$store.state.user.currentUser;
            },
            isNewTask() {
                return this.formTitle === 'Новая задача';
            },
            calendarEvents() {
                return this.$store.getters.eventDatesForUser(this.user.id);
            },
            overTimeCards() {
                return this.$store.getters.getOvertimeCards;
            },
            events() {
                return this.$store.getters.eventsByDateForUser(this.searchDate, this.user.id);
            },
            searchDate() {
               return moment(this.selectedDate_YYYYMMDD, 'YYYY-MM-DD');
            },
            oldEvents() {
                let startOfDay = this.searchDate.clone().startOf('d');
                return this.sortEvents( this.events.filter( event => this.eventDate(event).isBefore(startOfDay) ) );
            },
            todayEvents() {
                let today = this.searchDate.clone();
                return this.sortEvents( this.events.filter( event => this.eventDate(event).isSame(today, 'd') ) );
            },
            futureEvents() {
                let endOfDay = this.searchDate.clone().endOf('d');
                return this.sortEvents( this.events.filter( event => this.eventDate(event).isAfter(endOfDay) ) );
            }
        },
        created() {
            this.resetEvent();
            this.resetTask();
            this.refreshEvents();
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

    .v-dialog {
        z-index: 300!important;
    }

</style>
<style>
    .v-main.full-height,
    .v-main.full-height .v-main__wrap {
        height: 100%;
    }

    .timetable .theme--light.v-expansion-panels .v-expansion-panel {
        background: transparent;
    }

    .timetable .event-count {
        color: #16d1a5;
    }

    .timetable .time {
        color: #6ca4b3;
        font-size: 75%;
    }

    .postpone-menu .v-list-item {
        cursor: pointer;
    }

    .new-cardless-event-form .row {
        flex-direction: column!important;
    }
</style>