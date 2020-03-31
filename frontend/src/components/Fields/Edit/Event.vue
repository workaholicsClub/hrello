<template>
    <v-sheet elevation="0" class="my-1 px-1 bordered">
        <v-form>
            <v-container fluid class="py-0">
                <v-row align="center">
                    <v-col class="d-flex py-0" cols="12">
                        <v-text-field
                                v-model="value.name"
                                :label="isReminder ? 'Название напоминания' : 'Название события'"
                                hide-details
                                @input="commitUpdate"
                        ></v-text-field>
                    </v-col>
                </v-row>

                <v-row v-if="isReminder" class="pt-3">
                    <v-col cols="12">
                        <v-textarea
                                outlined
                                hide-details
                                rows="3"
                                label="Текст напоминания"
                                v-model="value.text"
                        ></v-textarea>
                    </v-col>
                </v-row>
                <v-row v-if="isReminder">
                    <v-col class="d-flex pb-0 px-0" cols="12">
                        <view-event v-model="value.dateStart" :event="{name: 'Когда начать напоминания'}"></view-event>
                    </v-col>
                </v-row>
                <v-row v-if="isReminder">
                    <v-col class="d-flex pb-0" cols="12" sm="6">
                        <v-select
                                v-model="value.repeatPeriodSeconds"
                                :items="remindPeriods"
                                label="Повторять напоминание"
                        ></v-select>
                    </v-col>
                    <v-col class="d-flex pb-0" cols="12" sm="6">
                        <v-select
                                v-model="value.targetType"
                                :items="targetTypes"
                                label="Способ отправки"
                                hide-details
                        ></v-select>
                    </v-col>
                </v-row>
                <v-row v-if="isReminder" class="py-0 px-3 mt-4">
                    <v-sheet v-if="value && value.file" class="p-0">
                        <v-icon>mdi-paperclip</v-icon>
                        <v-label>Прикрепленный файл</v-label>
                        <v-btn link :href="getDownloadUrl(value)" color="success" class="ml-4 download-btn" text>
                            {{value.file.name}}
                            <v-icon right dark>mdi-cloud-download</v-icon>
                        </v-btn>
                    </v-sheet>
                    <v-sheet class="pt-2 px-3 w-100" v-else>
                        <v-label>Прикрепить файл</v-label>
                        <v-file-input v-model="file" class="mt-4" label="Прикрепить файл" placeholder="Выбрать файл" hide-details dense full-width outlined>
                            <template v-slot:append>
                                <v-btn @click="sendFileUpload" text small color="success" :disabled="!file" :loading="fileUploadStarted">
                                    Прикрепить
                                    <v-icon right dark>mdi-cloud-upload</v-icon>
                                </v-btn>
                            </template>
                        </v-file-input>
                    </v-sheet>
                </v-row>

                <v-row class="d-flex" cols="12" v-if="!skipValueField">
                    <view-event v-model="value.value" :event="value"></view-event>
                </v-row>
                <v-row v-else-if="userIsAuthor && !skipGlobal">
                    <v-col class="d-flex pb-0" cols="12" sm="12">
                        <v-switch class="ma-2" v-model="value.isGlobal" :label="'Добавлять это ' + eventTypeText() + ' в новые карточки доски'" hide-details></v-switch>
                    </v-col>
                </v-row>
                <v-row v-if="userIsAuthor">
                    <v-col class="d-flex pb-0" cols="12" sm="12">
                        <v-switch class="ma-2" v-model="value.isPrivate" label="Показывать только мне" hide-details></v-switch>
                    </v-col>
                </v-row>

                <v-alert
                        v-if="value.linkToDefaultById"
                        dense
                        outlined
                        type="warning"
                        class="mb-0"
                >
                    {{value.isGlobal
                    ? eventTypeText(true) + ' будет изменено в этой и новых карточках'
                    : eventTypeText(true) + ' будет изменено только в этой карточке, а в новых останется прежним'}}
                </v-alert>
            </v-container>
        </v-form>
    </v-sheet>

</template>

<script>
    import ViewEvent from '../View/Event';

    export default {
        name: "EditEvent",
        props: ['card', 'value', 'skipGlobalSwitch', 'userIsAuthor', 'skipGlobal'],
        components: {
            ViewEvent
        },
        data() {
            return {
                name: '',
                isGlobal: false,
                file: null,
                fileUploadStarted: false,
                remindPeriods: [
                    {'text': 'Не повторять', value: 0},
                    {'text': 'Раз в час', value: 3600},
                    {'text': 'Раз в сутки', value: 86400},
                    {'text': 'Раз в неделю', value: 86400*7},
                ],
                targetTypes: [
                    {'text': 'Электропочта', value: 'email'},
                ]
            }
        },
        methods: {
            commitUpdate() {
                this.$emit('input', this.value);
            },
            updateValueFromDateTime() {
                let parsedDate = this.date ? new Date(this.date) : null;
                let parsedTime = this.time ? new Date('01-01-01 '+this.time) : null;

                let dateTimeSelected = parsedDate && parsedTime;

                if (dateTimeSelected) {
                    parsedDate.setHours(parsedTime.getHours());
                    parsedDate.setMinutes(parsedTime.getMinutes());

                    this.event.value = this.date;
                }
            },
            eventTypeText(titleCase) {
                if (titleCase) {
                    return this.value.eventType === 'reminder' ? 'Напоминание' : 'Событие';
                }
                else {
                    return this.value.eventType === 'reminder' ? 'напоминание' : 'событие';
                }
            },
            getDownloadUrl(field) {
                if (field.googleDrive) {
                    return field.googleDrive.downloadUrl;
                }
                else {
                    return field.uploadData.downloadUrl;
                }
            },
            sendFileUpload() {
                if (this.file) {
                    this.$root.$emit('fileUpload', {
                        field: this.value,
                        card: this.card,
                        file: this.file
                    });
                    this.fileUploadStarted = true;
                }
            },
        },
        watch: {
            isGlobal() {
                this.event.isGlobal = this.isGlobal;
                this.commitUpdate();
            }
        },
        computed: {
            skipValueField() {
                return !this.skipGlobalSwitch;
            },
            isReminder() {
                return this.value.eventType === 'reminder';
            },
        }

    }
</script>

<style scoped>

</style>