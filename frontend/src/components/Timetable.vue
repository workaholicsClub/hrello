<template>
    <v-content class="full-height">
        <v-container class="full-height p-sm-4 align-items-start" fluid >
            <v-row no-gutters>
                <v-col md="8" cols="12">
                    <v-row class="day-row p-sm-4" v-for="(events, dateText) in groupedEvents" :key="dateText"
                        :class="{'old': isOldFormattedDate(dateText)}"
                    >
                        <v-col md="3" cols="12" class="pr-4">
                            <h6>
                                {{dayName(dateText)}}
                            </h6>
                            <h2>
                                {{humanDate(dateText)}}
                            </h2>
                        </v-col>
                        <v-col md="9" cols="12">
                            <div v-for="(event, index) in events" :key="index">
                                <v-sheet elevation="2" v-if="event.isCardless"
                                    class="p-3 p-sm-4 mb-2 event-card"
                                    :class="{'old': isOldDate(event.value)}"
                                >
                                    <h3>{{event.name}}</h3>
                                    <p class="mb-0 d-flex justify-space-between">
                                        <span class="mr-4">{{humanTime(event.value)}}</span>
                                        <v-btn icon @click="sendDeleteEvent(event)"><v-icon>mdi-delete</v-icon></v-btn>
                                    </p>
                                </v-sheet>
                                <v-sheet elevation="2" v-else
                                        class="p-3 p-sm-4 mb-2 event-card"
                                        :class="{'old': isOldDate(event.value)}"
                                        @click="isOldDate(event.value) ? null : $root.$emit('selectCard', event.card.id)"
                                >
                                    <h3>{{event.card.name}}</h3>
                                    <p class="mb-0 d-flex justify-space-between">
                                        <span class="mr-4">{{humanTime(event.value)}}</span>
                                        <span>{{event.name}}</span>
                                        <span class="flex-fill"></span>
                                        <v-btn icon @click="$root.$emit('selectCard', event.card.id)"><v-icon>mdi-file-edit-outline</v-icon></v-btn>
                                    </p>
                                </v-sheet>
                            </div>
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
                        <span class="headline">Новое событие</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <edit-event v-model="newEvent" :skip-global-switch="true" class="pb-4"></edit-event>
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

    export default {
        name: "Timetable",
        props: ['groupedEvents', 'isDesktop'],
        components: {
            EditEvent
        },
        data() {
            return {
                showNewEventForm: false,
                newEvent: false,
            }
        },
        methods: {
            isOldDate(date) {
                return moment(date).isBefore( moment.now() );
            },
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
            humanTime(date) {
                return moment(date).format('HH:mm')
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
            sendSaveEventEvent() {
                this.$root.$emit('newCardlessEvent', this.newEvent);
                this.resetEvent();
                this.showNewEventForm = false;
            },
            sendDeleteEvent(event) {
                this.$root.$emit('deleteCardlessEvent', event);
            }
        },
        computed: {
        },
        created() {
            this.resetEvent();
        }
    }
</script>

<style scoped>
    .old {
        opacity: 0.3;
        filter: blur(1px);
    }
    .event-card:not(.old) {
        cursor: pointer;
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