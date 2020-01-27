<template>
    <v-sheet :elevation="onlyInput ? 0 : 2" :class="{'py-1 px-4': !onlyInput, 'light-green lighten-4': isMarkedSuccess }">
        <v-container fluid :class="{'py-0': onlyInput}">
            <v-row align="center">
                <!--v-col class="d-flex p-0" cols="12">
                    <v-datetime-picker
                            v-model="newValue"
                            :label="event.name"
                            :date-picker-props="{'events': activeEvents, 'locale': 'ru-ru' }"
                            :time-picker-props="{'format': '24hr', 'locale': 'ru-ru'}"
                            dateFormat="dd.MM.yyyy"
                            clear-text="Очистить"
                            :text-field-props="{'outlined': true}"
                    >
                        <template v-slot:dateIcon>
                            <v-icon>mdi-calendar</v-icon>
                        </template>
                        <template v-slot:timeIcon>
                            <v-icon>mdi-clock-outline</v-icon>
                        </template>
                    </v-datetime-picker>
                </v-col-->
                <v-col cols="12" md="6">
                    <v-text-field v-model="date" type="date" :label="event.name"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="time" type="time"></v-text-field>
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>
</template>

<script>
    import moment from 'moment';

    export default {
        name: "ViewEvent",
        props: ['event', 'onlyInput', 'value'],
        data() {
            let formatted = this.formatDateTime(this.value);

            return {
                newValue: formatted.dateTime,
                date: formatted.date,
                time: formatted.time
            }
        },
        methods: {
            activeEvents (date) {
                const [,, day] = date.split('-');
                if ([12, 17, 28].includes(parseInt(day, 10))) return true;
                if ([1, 19, 22].includes(parseInt(day, 10))) return ['red', '#00f'];
                return false;
            },
            updateValueFromDateTime() {
                let parsedDate = this.date ? new Date(this.date) : null;
                let parsedTime = this.time ? new Date('01-01-01 '+this.time) : null;

                let dateTimeSelected = parsedDate && parsedTime;

                if (dateTimeSelected) {
                    parsedDate.setHours(parsedTime.getHours());
                    parsedDate.setMinutes(parsedTime.getMinutes());

                    this.newValue = parsedDate;
                }
            },
            formatDateTime(value) {
                let dateTimeValue = value ? new Date(value) : null;
                let dateValue = moment(dateTimeValue).format('YYYY-MM-DD');
                let timeValue = moment(dateTimeValue).format('HH:mm');

                return {
                    dateTime: dateTimeValue,
                    date: dateValue,
                    time: timeValue
                }
            }
        },
        watch: {
            field: {
                handler() {
                    let formatted = this.formatDateTime(this.event.value);

                    this.newValue = formatted.dateTime;
                    this.date = formatted.date;
                    this.time = formatted.time;
                },
                deep: true
            },
            date() {
                this.updateValueFromDateTime();
            },
            time() {
                this.updateValueFromDateTime();
            },
            newValue() {
                this.$emit('input', this.newValue, this.event);
            }
        },
        computed: {
            isMarkedSuccess() {
                return Boolean(this.newValue) && !this.onlyInput;
            }
        }
    }
</script>

<style scoped>

</style>