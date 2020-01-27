<template>
    <v-content app class="card-details">
        <v-container class="fill-height align-start justify-start">
            <v-flex>
                <v-form ref="form">
                    <v-text-field
                            v-model="card.name"
                            label="Название карточки"
                            @input="$root.$emit('cardInput', card)"
                    ></v-text-field>

                    <view-field
                            v-for="field in globalFields"

                            :local-field="getGlobalFieldData(field.id)"
                            :global-field="field"
                            :card="card"
                            :only-input="true"
                            :value="getGlobalFieldValue(field.id)"
                            :key="getFieldKey(field)"

                            @input="sendUpdateGlobalFieldValue"
                            @inputField="sendUpdateGlobalField"
                    ></view-field>

                    <view-event
                            v-for="event in globalEvents"

                            :event="event"
                            :only-input="true"
                            :value="getGlobalFieldValue(event.id)"
                            :key="event.id"

                            @input="sendUpdateGlobalEventValue"
                    ></view-event>
                </v-form>

                <v-list-item v-if="editorType == 'field'">
                    <v-list-item-content>
                        <h4 class="pb-2">Новое поле данных</h4>
                        <edit-field v-model="newField"></edit-field>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-btn color="success" icon @click="sendSaveFieldEvent"><v-icon>mdi-check</v-icon></v-btn>
                        <v-btn color="error" icon @click="editorType = false"><v-icon>mdi-cancel</v-icon></v-btn>
                    </v-list-item-action>
                </v-list-item>

                <v-list-item v-if="editorType == 'comment'">
                    <v-list-item-content>
                        <h4 class="pb-2">Новый комментарий</h4>
                        <edit-comment v-model="newComment.text"></edit-comment>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-btn color="success" icon @click="sendSaveCommentEvent"><v-icon>mdi-check</v-icon></v-btn>
                        <v-btn color="error" icon @click="editorType = false"><v-icon>mdi-cancel</v-icon></v-btn>
                    </v-list-item-action>
                </v-list-item>

                <v-list-item v-if="editorType == 'event'">
                    <v-list-item-content>
                        <h4 class="pb-2">Новое событие</h4>
                        <edit-event v-model="newEvent"></edit-event>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-btn color="success" icon @click="sendSaveEventEvent"><v-icon>mdi-check</v-icon></v-btn>
                        <v-btn color="error" icon @click="editorType = false"><v-icon>mdi-cancel</v-icon></v-btn>
                    </v-list-item-action>
                </v-list-item>

                <draggable tag="div" class="v-list content-list v-sheet v-sheet--tile theme--light" role="list" v-model="draggableList" handle=".handle">
                    <v-list-item class="mb-0 p-0" v-for="record in card.content" :key="record.id">
                            <v-list-item-content>
                                <view-comment :comment="record" v-if="record.type == 'comment'"></view-comment>
                                <view-field
                                        v-if="record.type == 'field'"
                                        :local-field="record"
                                        :value="record.value"
                                        :card="card"
                                        :key="getFieldKey(record)"

                                        @input="sendUpdateContentValueEvent"
                                        @inputField="sendUpdateContentEvent"
                                ></view-field>
                                <view-event :event="record" :value="record.value" v-if="record.type == 'event'" @input="sendUpdateContentValueEvent"></view-event>
                            </v-list-item-content>
                            <v-list-item-action class="handle"><v-icon>mdi-menu</v-icon></v-list-item-action>
                    </v-list-item>
                </draggable>

            </v-flex>

            <v-speed-dial v-model="fabActive" bottom right fixed direction="top">
                <template v-slot:activator>
                    <v-btn v-model="fabActive" fab class="pink darken-1" dark>
                        <v-icon v-if="fabActive">mdi-close</v-icon>
                        <v-icon v-else>mdi-plus</v-icon>
                    </v-btn>
                </template>

                <v-btn fab small @click="editorType = 'event'">
                    <v-icon>mdi-calendar</v-icon>
                </v-btn>
                <v-btn fab small @click="editorType = 'field'">
                    <v-icon>mdi-textbox</v-icon>
                </v-btn>
                <v-btn fab small @click="editorType = 'comment'">
                    <v-icon>mdi-comment-outline</v-icon>
                </v-btn>
            </v-speed-dial>

        </v-container>
    </v-content>
</template>

<script>
    import draggable from "vuedraggable";

    import EditComment from "./Fields/Edit/Comment";
    import EditField from "./Fields/Edit/Field";
    import EditEvent from "./Fields/Edit/Event";

    import ViewComment from "./Fields/View/Comment";
    import ViewField from "./Fields/View/Field";
    import ViewEvent from "./Fields/View/Event";

    import {getGlobalFieldValue, getGlobalFieldData} from "../unsorted/Helpers";

    export default {
        name: "CardDetails",
        props: ['card', 'globalFields', 'globalEvents'],
        components: {
            EditComment,
            EditField,
            EditEvent,
            ViewComment,
            ViewField,
            ViewEvent,
            draggable
        },
        data() {
            return {
                editorType: false,
                newField: null,
                newComment:  null,
                newEvent: null,
                fabActive: false
            }
        },
        methods: {
            resetField() {
                this.newField = {
                    name: '',
                    type: 'field',
                    fieldType: false,
                    isGlobal: false,
                };
            },
            resetComment() {
                this.newComment = {
                    type: 'comment',
                    text: null,
                };
            },
            resetEvent() {
                this.newEvent = {
                    type: 'event',
                    isGlobal: false
                };
            },
            getGlobalFieldData(fieldId) {
                return getGlobalFieldData(fieldId, this.card);
            },
            getGlobalFieldValue(fieldId) {
                return getGlobalFieldValue(fieldId, this.card);
            },
            sendUpdateContentEvent(newValue, newContent, oldContent) {
                this.$root.$emit('updateContentCard', newValue, newContent, oldContent, this.card);
            },
            sendUpdateContentValueEvent(newValue, content) {
                this.$root.$emit('updateContentValueCard', newValue, content, this.card);
            },
            sendUpdateGlobalEventValue(newValue, event) {
                this.$root.$emit('updateGlobalEvent', newValue, event, this.card);
            },
            sendUpdateGlobalFieldValue(newValue, field) {
                this.$root.$emit('updateGlobalFieldValue', newValue, field, this.card);
            },
            sendUpdateGlobalField(newValue, newField, oldField) {
                this.$root.$emit('updateGlobalField', newValue, newField, oldField, this.card);
            },
            sendSaveFieldEvent() {
                if (this.newField.isGlobal) {
                    this.$root.$emit('newGlobalField', this.newField);
                }
                else {
                    this.$root.$emit('newContentCard', this.newField, this.card);
                }

                this.editorType = false;
                this.resetField();
            },
            sendSaveCommentEvent() {
                this.$root.$emit('newContentCard', this.newComment, this.card);
                this.editorType = false;
                this.resetComment();
            },
            sendSaveEventEvent() {
                if (this.newEvent.isGlobal) {
                    this.$root.$emit('newGlobalEvent', this.newEvent);
                }
                else {
                    this.$root.$emit('newContentCard', this.newEvent, this.card);
                }

                this.editorType = false;
                this.resetEvent();
            },
            getFieldKey(field) {
                let key = this.key ? this.key : '';
                key += field.id ? field.id : field.name;

                let data = field.isGlobal
                    ? this.getGlobalFieldData(field.id) || field
                    : field;

                if (data.file && data.file.name) {
                    key += data.file.name;
                }

                return key;
            }
        },
        computed: {
            draggableList: {
                get() {
                    return this.card.content;
                },
                set(value) {
                    this.$root.$emit('updateFieldsOrder', value, this.card);
                }
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
</style>
<style>
    .v-file-input legend {
        display: none;
    }
</style>
