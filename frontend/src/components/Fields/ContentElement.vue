<template>
    <v-sheet>
        <div v-if="record.isEditing">
            <v-list-item  class="mb-1 p-0">
                <v-list-item-content class="dash-bordered" :class="{'py-2': record.type !== 'comment', 'py-0': record.type === 'comment'}">
                    <edit-field v-if="record.type === 'field'"
                            v-model="newRecord"
                            :user-is-author="userIsAuthor"
                            :skip-global="skipGlobal"
                    ></edit-field>
                    <edit-comment v-if="record.type === 'comment'"
                            v-model="newRecord"
                            :user-is-author="userIsAuthor"
                    ></edit-comment>
                    <edit-event v-if="record.type === 'event'"
                            v-model="newRecord"
                            :card="card"
                            :user-is-author="userIsAuthor"
                            :skip-global="skipGlobal"
                    ></edit-event>
                </v-list-item-content>
                <v-list-item-action>
                    <v-btn color="success" icon @click="sendSaveRecordChange"><v-icon>mdi-check</v-icon></v-btn>
                    <v-btn color="error" icon @click="record.isEditing = false"><v-icon>mdi-cancel</v-icon></v-btn>
                </v-list-item-action>
            </v-list-item>
        </div>
        <div v-else>
            <v-list-item class="mb-1 p-0">
                <v-list-item-content class="bordered p-0 pb-2">
                    <view-comment v-if="record.type === 'comment'"
                            :comment="record"
                    ></view-comment>
                    <view-field v-if="record.type === 'field'"
                            :field="record"
                            :value="record.value"
                            :card="card"
                            :key="getFieldKey(record)"

                            @input="sendUpdateRecordValue"
                            @inputField="sendSaveRecordChange"
                    ></view-field>
                    <view-event v-if="record.type === 'event'"
                            :event="record"
                            :value="record.value"

                            @input="sendUpdateEventValue"
                    ></view-event>
                </v-list-item-content>
                <v-list-item-action class="d-flex py-0 my-0">
                    <v-btn icon text class="handle"><v-icon>mdi-cursor-move</v-icon></v-btn>
                    <v-menu bottom right offset-x @click.native.stop.prevent v-if="showActions">
                        <template v-slot:activator="{ on }">
                            <v-btn icon text v-on="on" @click.stop><v-icon>mdi-dots-horizontal</v-icon></v-btn>
                        </template>
                        <v-list>
                            <v-list-item @click="sendStartEditingEvent()">
                                <v-list-item-icon>
                                    <v-icon>mdi-pencil</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title>Редактировать поле</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="sendDeleteRecord">
                                <v-list-item-icon>
                                    <v-icon>mdi-delete</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title>{{record.isGlobal ? 'Удалить поле в этой карточке' : 'Удалить поле'}}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="sendDeleteRecordAndDefault" v-if="record.isGlobal && !skipGlobal">
                                <v-list-item-icon>
                                    <v-icon>mdi-delete-alert</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title>Удалить поле в этой и в новых карточках</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-list-item-action>
            </v-list-item>
        </div>
    </v-sheet>
</template>

<script>
    import EditComment from "./Edit/Comment";
    import EditField from "./Edit/Field";
    import EditEvent from "./Edit/Event";
    import ViewComment from "./View/Comment";
    import ViewField from "./View/Field";
    import ViewEvent from "./View/Event";

    import {clone} from "../../unsorted/Helpers";

    export default {
        name: "ContentElement",
        props: ['card', 'record', 'showEditor', 'userIsAuthor', 'skipGlobal'],
        components: {
            EditComment,
            EditField,
            EditEvent,
            ViewComment,
            ViewField,
            ViewEvent
        },
        data() {
            return {
                newRecord: false,
            }
        },
        created() {
            this.resetChanges();
        },
        watch: {
            record() {
                this.resetChanges();
            }
        },
        methods: {
            resetChanges() {
                this.newRecord = clone(this.record);
            },
            sendUpdateEventValue(newValue, event) {
                if (event) {
                    this.newRecord = event;
                }
                this.sendUpdateRecordValue(newValue);
            },
            sendUpdateRecordValue(newValue) {
                this.newRecord.value = newValue;
                this.sendSaveRecordChange();
            },
            sendSaveRecordChange() {
                this.newRecord.isEditing = false;
                this.$root.$emit('updateContent', this.newRecord, this.record, this.card);
                this.isEditing = false;
            },
            sendStartEditingEvent() {
                this.$root.$emit('startRecordEdit', this.record, this.card);
            },
            sendStopEditingEvent() {
                this.$root.$emit('stopRecordEdit', this.record, this.card);
            },
            sendDeleteRecord() {
                let deleteDefault = false;
                this.$root.$emit('deleteContent', this.record, this.card, deleteDefault);
            },
            sendDeleteRecordAndDefault() {
                let deleteDefault = true;
                this.$root.$emit('deleteContent', this.record, this.card, deleteDefault);
            },
            getFieldKey(field) {
                let key = this.key ? this.key : '';
                key += field.id ? field.id : field.name;

                if (field.file && field.file.name) {
                    key += field.file.name;
                }

                if (field.colors) {
                    let colorKey = field.colors.reduce( (key, item) => key + item.color + item.text, '');
                    key += colorKey;
                }

                return key;
            }
        },
        computed: {
            showActions() {
                let isNotComment = this.record.type !== 'comment';
                return isNotComment || this.userIsAuthor;
            }
        }
    }
</script>

<style scoped>

</style>