<template>
    <div class="datetime-wrapper">
        <v-text-field
                ref="input"
                v-model="dateForTextfield"
                label="Дата и время"
                :background-color="backgroundColor"
                solo
                dense
                hide-details
                @blur="updateFromTextfield(dateForTextfield)"
                @keydown="passFocusOrChangeValue"
        >
            <template v-slot:append>
                <v-menu
                        v-model="showDatePicker"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        locale="ru"
                        offset-y
                        max-width="290px"
                        min-width="290px"
                        style="top: -12px"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on">
                            <v-icon>mdi-calendar</v-icon>
                        </v-btn>
                    </template>
                    <v-date-picker
                            :value="dateForDatepicker"
                            no-title
                            locale="ru"
                            first-day-of-week="1"
                            @input="updateFromDatepicker"></v-date-picker>
                </v-menu>

                <v-menu
                        v-model="showTimePicker"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        locale="ru"
                        offset-y
                        max-width="290px"
                        min-width="290px"
                        style="top: -12px"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on">
                            <v-icon>mdi-clock-outline</v-icon>
                        </v-btn>
                    </template>
                    <v-time-picker
                            v-if="showTimePicker"
                            v-model="timeForTimepicker"
                            format="24hr"
                            no-title
                            @click:minute="updateFromTimepicker(timeForTimepicker)"
                    ></v-time-picker>
                </v-menu>


            </template>

        </v-text-field>
    </div>
</template>

<script>
    import moment from "moment";

    const DATEPICKER_FORMAT = 'YYYY-MM-DD';
    const TEXT_FORMAT = 'DD.MM.YYYY, HH:mm';
    const TIME_FORMAT = 'HH:mm'

    function formatForDatepicker(date) {
        return moment(date).format(DATEPICKER_FORMAT);
    }

    function formatForTextfield(date) {
        return moment(date).format(TEXT_FORMAT);
    }

    function formatForTimepicker(date) {
        return moment(date).format(TIME_FORMAT);
    }

    export default {
        name: "DateTimeNodeView",
        props: ['node', 'updateAttrs', 'view', 'selected', 'getPos'],
        data() {
            let enteredDate = this.node.attrs.value;

            return {
                date: enteredDate,
                dateForTextfield: formatForTextfield(enteredDate),
                dateForDatepicker: formatForDatepicker(enteredDate),
                timeForTimepicker: formatForTimepicker(enteredDate),
                showDatePicker: false,
                showTimePicker: false,
            }
        },
        watch: {
            selected() {
                if (this.selected) {
                    this.focusField();
                }
            },
        },
        methods: {
            focusField() {
                this.$refs.input.focus();
            },
            focusEditor() {
                this.view.focus();
            },
            passFocusOrChangeValue(event) {
                switch (event.key) {
                    case 'ArrowLeft':
                    case 'ArrowRight':
                        this.passFocusToEditorIfNeeded(event);
                    break;
                    case 'ArrowUp':
                    case 'ArrowDown':
                        this.changeValueAtCursor(event);
                    break;
                }
            },
            detectDatePartToChange(input) {
                let cursorPosition = input.selectionStart;
                let parts = [
                    { code: 'days', from: 0, to: 2 },
                    { code: 'months', from: 3, to: 5 },
                    { code: 'years', from: 6, to: 10 },
                    { code: 'hours', from: 12, to: 14 },
                    { code: 'minutes', from: 15, to: 17 },
                ];

                return parts.reduce((result, part) => {
                    if (cursorPosition >= part.from && cursorPosition <= part.to ) {
                        return part.code;
                    }

                    return result;
                }, false);
            },
            waitCursorPositionChange(input, timeout) {
                if (!timeout) {
                    timeout = 500;
                }

                let timePassed = 0;
                let intervalMs = 5;
                let initialPosition = input.selectionStart;

                return new Promise((resolve, reject) => {
                    let intervalId = setInterval(() => {
                        timePassed += intervalMs;
                        let currentPosition = input.selectionStart;

                        if (currentPosition !== initialPosition) {
                            resolve();
                        }

                        if (timePassed >= timeout) {
                            clearInterval(intervalId);
                            reject();
                        }
                    }, intervalMs);
                });
            },
            changeValueAtCursor(event) {
                let incrementRequested = event.key === 'ArrowUp';
                let input = event.target;
                let cursorPosition = input.selectionStart
                let datePart = this.detectDatePartToChange(input);
                let date = moment(input.value, TEXT_FORMAT);

                let newDate = incrementRequested
                    ? date.add(1, datePart)
                    : date.subtract(1, datePart);

                this.syncDates( newDate.toDate() );
                this.updateEditorValue();

                this.waitCursorPositionChange(input)
                    .finally(() => {
                        input.setSelectionRange(cursorPosition, cursorPosition);
                    });
            },
            passFocusToEditorIfNeeded(event) {
                let lastPosition = event.target.value.length;
                let isCursorAtStart = event.target.selectionStart === 0;
                let isCursorAtEnd = event.target.selectionEnd === lastPosition;
                let isMovingLeft = event.key === "ArrowLeft";
                let isMovingRight = event.key === "ArrowRight";

                if (isCursorAtStart && isMovingLeft) {
                    this.focusEditor();
                }
                else if (isCursorAtEnd && isMovingRight) {
                    this.focusEditor();
                }
            },
            syncDates(newParsedDate) {
                let isInvalidDate = Boolean(newParsedDate.getDate()) === false;
                if (isInvalidDate) {
                    return;
                }

                this.date = newParsedDate;
                this.dateForTextfield = formatForTextfield(newParsedDate);
                this.dateForDatepicker = formatForDatepicker(newParsedDate);
                this.timeForTimepicker = formatForTimepicker(newParsedDate);
            },
            updateFromDatepicker(newDateValue) {
                this.showDatePicker = false;
                let parsedDate = moment(newDateValue, DATEPICKER_FORMAT);
                this.syncDates( parsedDate.toDate() );
                this.updateEditorValue();
            },
            updateFromTimepicker(newTimeValue) {
                this.showTimePicker = false;
                let date = moment(this.date);
                let [newHours, newMinutes] = newTimeValue.split(':');
                let newDateTime = date.set({'hour': newHours, 'minute': newMinutes});
                this.syncDates( newDateTime.toDate() );
                this.updateEditorValue();
            },
            updateFromTextfield(newDateValue) {
                let parsedDate = moment(newDateValue, TEXT_FORMAT);
                this.syncDates( parsedDate.toDate() );
                this.updateEditorValue();
            },
            updateEditorValue() {
                this.updateAttrs({value: this.date});
            }
        },
        computed: {
            isOutdated() {
                return moment(this.date).isBefore( moment.now() );
            },
            backgroundColor() {
                return this.isOutdated
                    ? 'rgba(255, 0, 0, 0.2)'
                    : '#fff';
            }
        }
    }
</script>

<style scoped>
    .datetime-wrapper {
        max-width: 250px;
        display: inline-block;
        padding: 8px;
    }
</style>