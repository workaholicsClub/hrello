<template>
    <div class="card-details-menu">
        <div v-if="activeRecord">
            <v-subheader>{{activeRecord.name || (activeRecord.type === 'comment' ? 'Комментарий' : 'Поле')}}</v-subheader>
            <v-list-item @click="messageEditComponentToSaveRecord(activeRecord)" v-if="activeRecord.isEditing">
                <v-list-item-icon>
                    <v-icon>mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Сохранить изменения</v-list-item-title>
            </v-list-item>
            <v-list-item @click="messageEditComponentToCancelEdit(activeRecord)" v-if="activeRecord.isEditing">
                <v-list-item-icon>
                    <v-icon>mdi-cancel</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Отменить изменения</v-list-item-title>
            </v-list-item>
            <v-list-item @click="sendStartEditingEvent()" v-if="!activeRecord.isEditing">
                <v-list-item-icon>
                    <v-icon>mdi-pencil</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Редактировать поле</v-list-item-title>
            </v-list-item>
            <v-list-item @click="sendDeleteRecord">
                <v-list-item-icon>
                    <v-icon>mdi-delete</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{activeRecord.isGlobal ? 'Удалить здесь' : 'Удалить'}}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="sendDeleteRecordAndDefault" v-if="activeRecord.isGlobal && !skipGlobal">
                <v-list-item-icon>
                    <v-icon>mdi-delete-alert</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Удалить здесь и в шаблоне</v-list-item-title>
            </v-list-item>

            <div v-if="userIsAuthor && !activeRecord.isEditing">
                <v-divider></v-divider>
                <v-list-item>
                    <v-switch
                            class="ma-2"
                            v-model="activeRecord.isPrivate"
                            label="Показывать только мне"
                            hide-details
                            @change="triggerRecordSave(activeRecord)"
                    ></v-switch>
                </v-list-item >
                <v-list-item v-if="!skipGlobal">
                    <v-switch
                            class="ma-2"
                            v-model="activeRecord.isGlobal"
                            label="Использовать в шаблоне"
                            hide-details
                            @change="triggerRecordSave(activeRecord)"
                    ></v-switch>
                </v-list-item>
            </div>
        </div>

        <v-divider v-if="activeRecord"></v-divider>

        <v-list-group :value="addMenuExpanded">
            <template v-slot:activator>
                <v-list-item-icon>
                    <v-icon>mdi-plus</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Добавить данные</v-list-item-title>
            </template>

            <v-list-item @click="$emit('addEvent', 'basic')">
                <v-list-item-icon>
                    <v-icon>mdi-calendar</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Добавить событие</v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('addEvent', 'reminder')">
                <v-list-item-icon>
                    <v-icon>mdi-alarm</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Добавить напоминание</v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('addContent', 'comment')">
                <v-list-item-icon>
                    <v-icon>mdi-comment-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Добавить комментарий</v-list-item-title>
            </v-list-item>
            <v-list-item v-for="(fieldType, index) in fieldTypes" :key="fieldType.value+'_'+index" @click="$emit('addField', fieldType)">
                <v-list-item-icon>
                    <v-icon>{{fieldType.icon}}</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{fieldType.buttonText}}</v-list-item-title>
            </v-list-item>
        </v-list-group>
    </div>
</template>

<script>
    export default {
        name: "CardDetailsMenu",
        props: ['card', 'record', 'userIsAuthor', 'skipGlobal', 'fieldTypes', 'addMenuExpanded'],
        data() {
            return {
                activeRecord: this.record
            }
        },
        watch: {
            record() {
                this.activeRecord = this.record;
            }
        },
        methods: {
            messageEditComponentToSaveRecord(contentToEdit) {
                this.$root.$emit('saveContentButtonPressed', contentToEdit, this.card);
            },
            messageEditComponentToCancelEdit(contentToStopEdit) {
                this.$root.$emit('cancelContentButtonPressed', contentToStopEdit, this.card);
            },
            triggerRecordSave(changedRecord) {
                let oldRecord = this.card.content.find(record => record.id === changedRecord.id);
                if (oldRecord) {
                    this.$root.$emit('updateContent', this.activeRecord, oldRecord, this.card);
                }
            },
            sendStartEditingEvent() {
                this.$root.$emit('startRecordEdit', this.activeRecord, this.card);
            },
            sendDeleteRecord() {
                let deleteDefault = false;
                this.$emit('deleteContent', this.activeRecord, this.card, deleteDefault)
                this.$root.$emit('deleteContent', this.activeRecord, this.card, deleteDefault);
            },
            sendDeleteRecordAndDefault() {
                let deleteDefault = true;
                this.$emit('deleteContent', this.activeRecord, this.card, deleteDefault)
                this.$root.$emit('deleteContent', this.activeRecord, this.card, deleteDefault);
            },

        }
    }
</script>

<style>
    .card-details-menu .v-icon {
        color: #261440!important;
    }
</style>