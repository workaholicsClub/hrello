<template>
    <v-content app>
        <v-container class="fill-height p-sm-4 align-items-start" fluid >

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
                                    <p class="mb-0">
                                        <span class="mr-4">{{humanTime(event.value)}}</span>
                                    </p>
                                </v-sheet>
                                <v-sheet elevation="2" v-else
                                        class="p-3 p-sm-4 mb-2 event-card"
                                        :class="{'old': isOldDate(event.value)}"
                                        @click="isOldDate(event.value) ? null : $root.$emit('selectCard', event.card.id)"
                                >
                                    <h3>{{event.card.name}}</h3>
                                    <p class="mb-0">
                                        <span class="mr-4">{{humanTime(event.value)}}</span>
                                        <span>{{event.name}}</span>
                                    </p>
                                </v-sheet>
                            </div>
                        </v-col>
                    </v-row>


                </v-col>
                <v-col md="4" cols="12" v-if="showNewEventForm">
                    <v-sheet class="new-cardless-event-form" :class="{'fixed': isDesktop}">
                        <edit-event v-model="newEvent" :skip-global-switch="true"></edit-event>
                        <v-container class="d-flex justify-space-between p-0 mt-2">
                            <v-btn color="success" @click="sendSaveEventEvent"><v-icon>mdi-check</v-icon></v-btn>
                            <v-btn color="error" @click="showNewEventForm = false"><v-icon>mdi-cancel</v-icon></v-btn>
                        </v-container>
                    </v-sheet>
                </v-col>
            </v-row>

            <v-btn fab class="pink darken-1" fixed bottom right dark @click="toggleNewEventForm">
                <v-icon>mdi-plus</v-icon>
            </v-btn>

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
                    isCardless: true
                };
            },
            sendSaveEventEvent() {
                this.$root.$emit('newCardlessEvent', this.newEvent);
                this.resetEvent();
                this.showNewEventForm = false;
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
    .new-cardless-event-form {
        background: none;
    }

    .new-cardless-event-form.fixed {
        position: fixed;
        bottom: 90px;
    }
</style>
<style>
    .new-cardless-event-form .row {
        flex-direction: column!important;
    }

    .new-cardless-event-form .col-12,
    .new-cardless-event-form .col-sm-3,
    .new-cardless-event-form .col-sm-6 {
        flex: 0 0 100%;
        max-width: 100%;
    }
</style>