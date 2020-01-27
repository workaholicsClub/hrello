<template>
    <v-sheet elevation="10" class="py-1 px-4">
        <v-form>
            <v-container fluid>
                <v-row align="center">
                    <v-col class="d-flex" cols="12" sm="9">
                        <v-text-field
                                v-model="name"
                                label="Название события"
                        ></v-text-field>
                    </v-col>

                    <v-col class="d-flex" cols="12" sm="3" v-if="!skipValueField">
                        <v-datetime-picker
                                v-model="date"
                                label="Дата и время"
                                :date-picker-props="{'events': activeEvents, 'locale': 'ru-ru'}"
                                :time-picker-props="{'format': '24hr', 'locale': 'ru-ru'}"
                                dateFormat="dd.MM.yyyy"
                                clear-text="Очистить"
                        >
                            <template v-slot:dateIcon>
                                <v-icon>mdi-calendar</v-icon>
                            </template>
                            <template v-slot:timeIcon>
                                <v-icon>mdi-clock-outline</v-icon>
                            </template>
                        </v-datetime-picker>
                    </v-col>

                    <v-col class="d-flex" cols="12" sm="3" v-if="!skipGlobalSwitch">
                        <v-switch class="ma-2" v-model="isGlobal" label="Для всех карточек"></v-switch>
                    </v-col>

                </v-row>
            </v-container>
        </v-form>
    </v-sheet>

</template>

<script>
    export default {
        name: "EditEvent",
        props: ['value', 'skipGlobalSwitch'],
        data() {
            return {
                name: '',
                date: null,
                isGlobal: false,
                event: this.value,
            }
        },
        methods: {
            activeEvents (date) {
                const [,, day] = date.split('-');
                if ([12, 17, 28].includes(parseInt(day, 10))) return true;
                if ([1, 19, 22].includes(parseInt(day, 10))) return ['red', '#00f'];
                return false;
            },
            commitUpdate() {
                this.$emit('input', this.event);
            }
        },
        watch: {
            name() {
                this.event.name = this.name;
                this.commitUpdate();
            },
            date() {
                this.event.value = this.date;
                this.commitUpdate();
            },
            isGlobal() {
                this.event.isGlobal = this.isGlobal;
                this.commitUpdate();
            },
        },
        computed: {
            skipValueField() {
                return !this.skipGlobalSwitch;
            }
        }

    }
</script>

<style scoped>

</style>