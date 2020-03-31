<template>
    <v-sheet :elevation="0" class="my-1 px-1 w-100">
        <v-container fluid class="py-0">
            <v-row v-if="event.eventType === 'reminder'">
                <v-card-text class="text--primary">
                    <v-icon>mdi-alarm</v-icon>
                    Напоминание: {{event.name}}
                    <v-card-subtitle class="text--secondary py-0 pl-7">
                        {{alarmDescription}}
                    </v-card-subtitle>
                    <v-card-subtitle class="text--secondary py-0 pl-7" v-if="isAlarmOutdated">
                        Оповещение выполнено
                    </v-card-subtitle>
                </v-card-text>
                <v-card-text v-html="event.text" class="text--primary py-0"></v-card-text>
                <v-card-text>
                    <v-row>
                        <v-col class="d-flex pb-0" cols="12" sm="6">
                            <v-text-field
                                    v-model="event.targetContact"
                                    :label="targetContactLabel"
                                    :disabled="isAlarmOutdated"
                                    hide-details
                                    @input="sendUpdateEvent"
                                    @change="sendUpdateEvent"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="d-flex pb-0" cols="12" sm="12">
                            <v-switch class="ma-2"
                                    v-model="event.isActive"
                                    :label="event.isActive ? 'Включено' : 'Отключено'"
                                    hide-details
                                    :disabled="isAlarmOutdated"
                                    @change="sendUpdateEvent"
                            ></v-switch>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-row>
            <v-row align="center" v-else>
                <v-col cols="12" md="4" class="py-0">
                    <v-text-field v-model="date" type="date" :label="onlyInput ? '' : event.name" hide-details
                            @input="updateValueFromDateTime"
                            @change="updateValueFromDateTime"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" md="8" class="py-0 d-flex align-items-center">
                    <span class="mr-4 mt-3">в</span>
                    <v-text-field v-model="time" type="time" hide-details
                            @input="updateValueFromDateTime"
                            @change="updateValueFromDateTime"
                    ></v-text-field>
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>
</template>

<script>
    import moment from 'moment';
    import {isValidDate} from "../../../unsorted/Helpers";

    export default {
        name: "ViewEvent",
        props: ['event', 'onlyInput', 'value'],
        data() {
            let formatted = this.formatDateTime(this.value);

            return {
                newValue: formatted.dateTime,
                date: formatted.date,
                time: formatted.time,
            }
        },
        methods: {
            updateValueFromDateTime() {
                let parsedDate = this.date ? new Date(this.date) : null;
                let parsedTime = this.time ? new Date('01-01-01 '+this.time) : null;

                let dateTimeSelected = isValidDate(parsedDate) && isValidDate(parsedTime);

                if (dateTimeSelected) {
                    parsedDate.setHours(parsedTime.getHours());
                    parsedDate.setMinutes(parsedTime.getMinutes());

                    this.newValue = parsedDate;
                    this.sendUpdateEvent();
                }
            },
            sendUpdateEvent() {
                this.$emit('input', this.newValue, this.event);
            },
            formatDateTime(value) {
                let dateTimeValue = new Date(value);
                if ( isValidDate(dateTimeValue) ) {
                    let dateValue = moment(dateTimeValue).format('YYYY-MM-DD');
                    let timeValue = moment(dateTimeValue).format('HH:mm');

                    return {
                        dateTime: dateTimeValue,
                        date: dateValue,
                        time: timeValue
                    }
                }

                return false;
            },
        },
        watch: {
            event: {
                handler() {
                    let formatted = this.formatDateTime(this.event.value);

                    if (formatted !== false) {
                        this.newValue = formatted.dateTime || null;
                        this.date = formatted.date || null;
                        this.time = formatted.time || null;
                    }
                },
                deep: true
            },
        },
        computed: {
            isMarkedSuccess() {
                return Boolean(this.newValue) && !this.onlyInput;
            },
            nextAlarm() {
                let startTime = moment(this.event.dateStart);
                let nextAlarm = startTime;
                let now = moment();

                if (this.event.repeatPeriodSeconds > 0) {
                    while (nextAlarm.isBefore(now)) {
                        nextAlarm.add(this.event.repeatPeriodSeconds, 's');
                    }
                }

                return nextAlarm.toDate();
            },

            alarmDescription() {
                let nextAlarmText = moment(this.nextAlarm).format('DD.MM.YYYY (dddd) в HH:mm');
                return this.isAlarmOutdated
                    ? 'Последнее оповещение ' + nextAlarmText
                    : 'Следующее оповещение ' + nextAlarmText;
            },

            isAlarmOutdated() {
                let now = moment();
                return moment(this.nextAlarm).isBefore(now);
            },

            targetContactLabel() {
                return 'Электропочта для напоминаний';
            }
        }
    }
</script>

<style scoped>

</style>