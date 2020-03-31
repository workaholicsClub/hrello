<template>
    <v-content class="card-details fill-height">
        <v-container class="align-start justify-start" fill-height>
                <v-container>
                    <v-text-field
                            v-model="card.name"
                            label="ФИО кандидата"
                            @input="sendSaveCardEvent"
                    ></v-text-field>

                    <v-select
                            v-model="card.statusId"
                            :items="statuses"
                            item-text="title"
                            item-value="id"
                            label="Текущий этап"
                            @change="sendSaveCardEvent"
                    ></v-select>

                    <draggable tag="div" class="v-list content-list v-sheet v-sheet--tile theme--light" role="list" v-model="card.content" handle=".handle">
                        <content-element
                                v-for="(record, index) in visibleRecords"
                                :key="getRecordKey(record, index)"
                                :card="card" :record="record" :show-editor="record.isEditing || false"
                                :user-is-author="userIsAuthor(record)"
                        ></content-element>
                    </draggable>
                </v-container>

                <v-toolbar class="card-toolbar d-none d-sm-flex mb-4" bottom dark dense floating>
                    <v-tooltip class="mb-2" top>
                        <template v-slot:activator="{ on }">
                            <v-btn small icon @click="addNewEvent('basic')" v-on="on"><v-icon>mdi-calendar</v-icon></v-btn>
                        </template>
                        <span>Событие</span>
                    </v-tooltip>
                    <v-tooltip class="mb-2" top>
                        <template v-slot:activator="{ on }">
                            <v-btn small icon @click="addNewEvent('reminder')" v-on="on"><v-icon>mdi-alarm</v-icon></v-btn>
                        </template>
                        <span>Напоминание</span>
                    </v-tooltip>

                    <v-tooltip class="mb-2" top>
                        <template v-slot:activator="{ on }">
                            <v-btn small icon @click="addNewContent('comment')" v-on="on"><v-icon>mdi-comment-outline</v-icon></v-btn>
                        </template>
                        <span>Комментарий</span>
                    </v-tooltip>

                    <v-tooltip class="mb-2" top v-for="(fieldType, index) in fieldTypes" :key="'btn'+fieldType.value+index">
                        <template v-slot:activator="{ on }">
                            <v-btn small icon @click="addNewField(fieldType)" v-on="on"><v-icon>{{fieldType.icon}}</v-icon></v-btn>
                        </template>
                        <span>{{fieldType.buttonText}}</span>
                    </v-tooltip>
                </v-toolbar>

                <v-speed-dial v-model="fabActive" bottom right fixed direction="top" class="d-sm-none">
                    <template v-slot:activator>
                        <v-btn v-model="fabActive" fab class="pink darken-1" dark>
                            <v-icon v-if="fabActive">mdi-close</v-icon>
                            <v-icon v-else>mdi-plus</v-icon>
                        </v-btn>
                    </template>

                    <v-container class="p-0 pr-1 d-flex justify-content-end align-items-center">
                        <v-label small @click="addNewEvent('basic')">Событие</v-label>
                        <v-btn fab small @click="addNewEvent('basic')"><v-icon>mdi-calendar</v-icon></v-btn>
                    </v-container>
                    <v-container class="p-0 pr-1 d-flex justify-content-end align-items-center">
                        <v-label small @click="addNewEvent('reminder')">Напоминание</v-label>
                        <v-btn fab small @click="addNewEvent('reminder')"><v-icon>mdi-alarm</v-icon></v-btn>
                    </v-container>
                    <v-container class="p-0 pr-1 d-flex justify-content-end align-items-center">
                        <v-label small @click="addNewContent('comment')">Комментарий</v-label>
                        <v-btn fab small @click="addNewContent('comment')"><v-icon>mdi-comment-outline</v-icon></v-btn>
                    </v-container>
                    <v-container class="p-0 pr-1 d-flex justify-content-end align-items-center" v-for="fieldType in fieldTypes" :key="fieldType.value">
                        <v-label small @click="addNewField(fieldType)">{{fieldType.buttonText}}</v-label>
                        <v-btn fab small @click="addNewField(fieldType)"><v-icon>{{fieldType.icon}}</v-icon></v-btn>
                    </v-container>
                </v-speed-dial>

        </v-container>
    </v-content>
</template>

<script>
    import draggable from "vuedraggable";
    import ContentElement from "./Fields/ContentElement";
    import {getFieldTypes} from "../unsorted/Helpers";

    export default {
        name: "CardDetails",
        props: ['card', 'statuses', 'user'],
        components: {
            ContentElement,
            draggable
        },
        data() {
            return {
                editorType: false,
                newField: null,
                newComment:  null,
                newEvent: null,
                fabActive: false,
                fieldTypes: getFieldTypes()
            }
        },
        methods: {
            getRecordKey(record, index) {
                let version = record.version || 0;
                let isEditing = record.isEditing ? 1 : 0;
                return [record.id, index, version, isEditing].join('_');
            },
            userIsAuthor(record) {
                let hasAuthor = Boolean(record.author);
                return  hasAuthor && record.author.id === this.user.id;
            },
            isVisible(record) {
                let isCurrentUserAuthor = this.userIsAuthor(record);
                let isRecordPublic = !record.isPrivate;

                return isCurrentUserAuthor || isRecordPublic;
            },
            resetField() {
                this.newField = {
                    name: '',
                    author: this.user,
                    type: 'field',
                    fieldType: false,
                    isGlobal: false,
                };
            },
            resetComment() {
                this.newComment = {
                    type: 'comment',
                    author: this.user,
                    text: null,
                };
            },
            resetEvent() {
                this.newEvent = {
                    type: 'event',
                    eventType: 'basic',
                    author: this.user,
                    isGlobal: false
                };
            },
            addNewContent(type) {
                let ucType = type[0].toUpperCase()+type.slice(1);
                let varName = 'new'+ucType;
                let record = this[varName];

                this.$root.$emit('newContentCard', record, this.card);
                this.resetField();
            },
            addNewEvent(type) {
                this.newEvent.eventType = type;
                if (type === 'reminder') {
                    this.newEvent.dateStart = Date.now();
                    this.newEvent.repeatPeriodSeconds = 0;
                    this.newEvent.text = '';
                    this.newEvent.targetType = 'email';
                    this.newEvent.targetContact = '';
                    this.newEvent.isActive = true;
                }

                this.addNewContent('event');
            },
            addNewField(defaultFieldData) {
                this.newField.fieldType = defaultFieldData.value;
                this.newField.name  = defaultFieldData.fieldName;
                this.addNewContent('field');
            },
            sendSaveCardEvent() {
                this.$root.$emit('cardInput', this.card);
            }
        },
        computed: {
            visibleRecords() {
                return this.card.content ? this.card.content.filter(this.isVisible) : [];
            }
        },
        created() {
            this.resetField();
            this.resetComment();
            this.resetEvent();
        }
    }
</script>

<style scoped>
    .card-details {
        background: #fff;
    }

    .content-list .v-card {
        width: 100%;
    }

    .v-list-item__content {
        overflow: visible;
    }

    .v-toolbar {
        left: 50%;
        margin-left: -150px;
        position: fixed;
    }
</style>
<style>
    .v-file-input legend {
        display: none;
    }

    .bordered {
        border: 1px solid rgba(0, 0, 0, 0.42);
        border-radius: 4px;
        /*box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12) !important;*/
    }

    .dash-bordered {
        border: 1px dashed rgba(0, 0, 0, 0.42);
        border-radius: 4px;
    }

    .v-speed-dial__list{
        width: 300px!important;
        margin-left: -244px;
    }

    .v-speed-dial__list .v-label {
        color: rgba(0, 0, 0, 0.87);
        background-color: #f5f5f5;
        margin-bottom: 0;
        margin-right: 0.5rem;
        padding: 0.25rem;
        border-radius: 4px;

        -webkit-box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
        box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
    }

    .card-toolbar .v-toolbar__content {
        width: 300px;
        justify-content: space-around;
    }

    .v-tooltip__content {
        margin-bottom: .5rem!important;
        margin-top: -0.5rem!important;
    }

</style>
