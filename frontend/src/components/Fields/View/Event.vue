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
                    <v-text-field v-model="date" type="date" :label="onlyInput ? '' : 'Дата события'" hide-details
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
    import ViewEvent from './Event';
    export default ViewEvent;
</script>

<style scoped>

</style>