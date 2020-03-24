<template>
    <v-sheet :elevation="0" class="my-1 px-1 w-100">
        <v-container fluid class="py-0">
            <v-row align="center">
                <v-col cols="12" md="3" class="py-0">
                    <v-text-field v-model="date" type="date" :label="onlyInput ? '' : event.name" hide-details
                            @input="updateValueFromDateTime"
                            @change="updateValueFromDateTime"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" md="9" class="py-0 d-flex align-items-center">
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
                    this.$emit('input', this.newValue, this.event);
                }
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

                return {
                    dateTime: null,
                    date: null,
                    time: null
                }
            }
        },
        watch: {
            event: {
                handler() {
                    let formatted = this.formatDateTime(this.event.value);

                    this.newValue = formatted.dateTime || null;
                    this.date = formatted.date || null;
                    this.time = formatted.time || null;
                },
                deep: true
            },
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