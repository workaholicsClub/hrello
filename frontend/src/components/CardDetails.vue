<template>
    <component :is="mainComponent" class="fill-height" @click="activateRecord(null)">
        <v-navigation-drawer v-if="!isDesktop"
                v-model="editDrawer"
                absolute
                top
                left
                temporary
        >
            <card-details-menu
                    :record="activeRecord"
                    :user-is-author="userIsAuthor(activeRecord)"
                    :skip-global="skipGlobal"
                    :card="card"
                    :field-types="fieldTypes"
                    :add-menu-expanded="!Boolean(activeRecord)"

                    @addEvent="addNewEvent"
                    @addContent="addNewContent"
                    @addField="addNewField"

                    :key="(activeRecord ? activeRecord.id || activeRecord.name : 'add') + '_nav'"
            ></card-details-menu>
        </v-navigation-drawer>

        <v-row class="px-4 mr-0">
            <v-col cols="3" sticky-container v-if="isDesktop">
                <v-card v-sticky sticky-offset="{top: 68}" sticky-side="top">
                    <card-details-menu
                            :record="activeRecord"
                            :user-is-author="userIsAuthor(activeRecord)"
                            :skip-global="skipGlobal"
                            :card="card"
                            :field-types="fieldTypes"
                            :add-menu-expanded="!Boolean(activeRecord)"

                            @addEvent="addNewEvent"
                            @addContent="addNewContent"
                            @addField="addNewField"
                            @deleteContent="onDeleteContent"

                            :key="(activeRecord ? activeRecord.id || activeRecord.name : 'add') + '_menu'"
                    ></card-details-menu>
                </v-card>
            </v-col>

            <v-col :cols="isDesktop ? 9 : 12">
                <v-container class="p-0">
                    <v-card class="pt-2 px-4">
                        <v-text-field
                                v-model="card.name"
                                label="ФИО кандидата"
                                @input="sendSaveCardEvent"
                        ></v-text-field>

                        <v-select
                                v-if="statuses"
                                v-model="card.statusId"
                                :items="statuses"
                                item-text="title"
                                item-value="id"
                                label="Текущий этап"
                                @change="sendSaveCardEvent"
                        ></v-select>
                    </v-card>

                    <draggable tag="div" class="v-list content-list v-sheet v-sheet--tile theme--light" role="list" v-model="card.content" handle=".handle">
                        <content-element
                                v-for="(record, index) in visibleRecords"
                                :key="getRecordKey(record, index)"
                                :card="card"
                                :record="record"
                                :show-editor="record.isEditing || false"
                                :user-is-author="userIsAuthor(record)"
                                :skip-global="skipGlobal"

                                :class="{'active': activeRecord === record}"

                                @active="activateRecord"
                                @updateContent="resetActiveRecord"
                        ></content-element>
                    </draggable>
                </v-container>
            </v-col>
        </v-row>

        <v-btn v-if="!isDesktop" fab class="pink darken-1" bottom right fixed dark @click="toggleEditDrawer">
            <v-icon v-if="editDrawer">mdi-close</v-icon>
            <v-icon v-else-if="activeRecord">mdi-settings</v-icon>
            <v-icon v-else>mdi-plus</v-icon>
        </v-btn>
    </component>
</template>

<script>
    import draggable from "vuedraggable";
    import ContentElement from "./Fields/ContentElement";
    import {getFieldTypes} from "../unsorted/Helpers";
    import CardDetailsMenu from "./Menus/CardDetailsMenu";

    export default {
        name: "CardDetails",
        components: {
            ContentElement,
            CardDetailsMenu,
            draggable
        },
        props: ['inPopup'],
        data() {
            return {
                editorType: false,
                newField: null,
                newComment:  null,
                newEvent: null,
                fabActive: false,
                fieldTypes: getFieldTypes(),
                activeRecord: null,
                editDrawer: false,
                skipGlobal: false,
            }
        },
        methods: {
            toggleEditDrawer() {
                this.editDrawer = !this.editDrawer;
            },
            activateRecord(newActiveRecord) {
                let shouldDeactivate = this.activeRecord === newActiveRecord && !this.activeRecord.isEditing;

                this.activeRecord = shouldDeactivate ? null : newActiveRecord;
            },
            resetActiveRecord() {
                this.activeRecord = null;
            },
            getRecordKey(record, index) {
                let version = record.version || 0;
                let isEditing = record.isEditing ? 1 : 0;
                return [record.id, index, version, isEditing].join('_');
            },
            userIsAuthor(record) {
                let hasAuthor = Boolean(record) && Boolean(record.author);
                return hasAuthor && record.author.id === this.user.id;
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

                this.activeRecord = record;
                this.$root.$emit('newContentCard', record, this.card, this.board);
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
            onDeleteContent() {
                this.activeRecord = null;
            },
            sendSaveCardEvent() {
                this.$root.$emit('cardInput', this.card, this.board);
            },
        },
        computed: {
            mainComponent() {
                return this.inPopup ? 'v-card' : 'v-main';
            },
            card() {
                return this.$store.state.card.currentCard;
            },
            user() {
                return this.$store.state.user.currentUser;
            },
            isDesktop() {
                return this.$isDesktop();
            },
            visibleRecords() {
                return this.card.content ? this.card.content.filter(this.isVisible) : [];
            },
            statuses() {
                let board = this.$store.getters.boardByCard(this.card);
                return board && board.statuses
                    ? board.statuses
                    : [];
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

    .content-list {
        background: transparent;
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

    .content-list .v-sheet {
        background: transparent;
    }

    .content-list > .v-card {
        background: #fff;
    }
    .content-list > .v-card.active {
        background: #d4effa!important;
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
