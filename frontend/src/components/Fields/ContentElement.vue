<template>
    <v-card @click="activate" :class="{'v-card__editing': record.isEditing, 'mb-1': record.isEditing}">
        <div v-if="record.isEditing">
            <v-list-item class="mb-1 p-0">
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
            </v-list-item>
        </div>
        <div v-else>
            <v-list-item class="mb-1 p-0 d-flex flex-row align-items-stretch">
                <div class="handle"><div class="handle-bg"></div></div>
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
            </v-list-item>
        </div>
    </v-card>
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
            activate() {
                this.$emit('active', this.record);
            },
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
                this.$emit('updateContent', this.newRecord, this.record, this.card);
                this.$root.$emit('updateContent', this.newRecord, this.record, this.card);
                this.isEditing = false;
            },
            sendStartEditingEvent() {
                this.$root.$emit('startRecordEdit', this.record, this.card);
            },
            sendStopEditingEvent() {
                this.$root.$emit('stopRecordEdit', this.record, this.card);
            },
            receiveSaveDataEvent(recordToSave) {
                let isMyEvent = this.record === recordToSave;
                if (isMyEvent) {
                    this.sendSaveRecordChange();
                }
            },
            receiveCancelEditEvent(recordToCancelEdit) {
                let isMyEvent = this.record === recordToCancelEdit;
                if (isMyEvent) {
                    this.newRecord.isEditing = false;
                    this.isEditing = false;
                    this.sendStopEditingEvent();
                }
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
        },
        mounted() {
            this.$root.$on('saveContentButtonPressed', this.receiveSaveDataEvent);
            this.$root.$on('cancelContentButtonPressed', this.receiveCancelEditEvent);
        },
        beforeDestroy() {
            this.$root.$off('saveContentButtonPressed', this.receiveSaveDataEvent);
            this.$root.$off('cancelContentButtonPressed', this.receiveCancelEditEvent);
        }
    }
</script>

<style scoped>
    .v-card__editing {
        border: 1px dashed rgba(0, 0, 0, 0.54);
    }
    .handle {
        background: #fff;
        padding: 6px;
        cursor: grab;
    }
    .handle .handle-bg {
        background: url('/assets/handle_dot.png') repeat;
        width: 16px;
        height: 100%;
    }
</style>