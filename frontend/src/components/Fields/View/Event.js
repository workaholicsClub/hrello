import moment from 'moment';
import {isValidDate} from '../../../unsorted/Helpers';

export default {
    name: "ViewEvent",
    props: ['event', 'onlyInput', 'value'],
    data() {
        let formatted = this.formatDateTime(this.value);

        return {
            newValue: formatted.dateTime || null,
            date: formatted.date || null,
            time: formatted.time || null,
        }
    },
    methods: {
        updateValueFromDateTime() {
            if (!this.date || !this.time) {
              return;
            }

            const parsedDateTime = moment(`${this.date} ${this.time}`, 'YYYY-MM-DD HH:mm');
            if (!parsedDateTime.isValid()) {
              return;
            }

            this.newValue = parsedDateTime.toDate();
            this.sendUpdateEvent();
        },
        sendUpdateEvent() {
            this.$emit('input', this.newValue, this.event);
        },
        formatDateTime(value) {
            if (!value) {
                return {
                    dateTime: null,
                    date: null,
                    time: null
                }
            }

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