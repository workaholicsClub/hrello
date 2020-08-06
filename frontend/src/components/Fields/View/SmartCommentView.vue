<template>
    <v-row class="p-0 pb-2">
        <v-col class="avatar-col">
            <v-avatar size="36px">
                <v-img v-if="field.author && field.author.imageUrl" :src="field.author.imageUrl"/>
                <v-icon v-else>mdi-account-circle</v-icon>
            </v-avatar>
        </v-col>
        <v-col>
            <div class="mb-1 d-flex" :class="{'flex-column': infoAsColumn}">
                <a href="#"><small>{{field.author.fullName}}</small></a>
                <span class="flex-fill"></span>
                <small class="text-muted">
                    <span>{{commentDate}}</span>
                    <span v-if="taskComplete"><br>сделано</span>
                </small>
            </div>
            <div v-if="field.fieldType === 'task'" v-html="field.task.text"></div>
            <div v-else-if="field.type === 'event'">
                {{field.name}}
                <span class="date-time-container">{{eventDate}}</span>
            </div>
            <div v-else-if="field.fieldType === 'color'">
                <p>{{field.name}}</p>
                <v-chip label small v-for="value in colorValues" :color="value.color" :key="value.color" class="mr-2">{{value.text || value.defaultName}}</v-chip>
            </div>
            <div v-else-if="field.fieldType === 'file'">
                <p>{{field.name}}</p>
                <v-chip label outlined @click="downloadFile(field)">
                    <v-icon left>mdi-paperclip</v-icon>
                    {{field.file.name}}
                </v-chip>
            </div>
            <div v-else-if="field.fieldType === 'text'">
                <p>{{field.name}}</p>
                <p>{{field.value}}</p>
            </div>
            <div v-else-if="field.fieldType === 'checkbox'">
                <p>{{field.name}}</p>
                <ul data-type="todo_list">
                    <li data-type="todo_item" v-for="(task, index) in field.tasks" :key="index" :data-done="task.done ? 'true' : 'false'">
                        <span class="todo-checkbox" ></span>
                        <div class="todo-content">{{task.text}}</div>
                    </li>
                </ul>
            </div>
            <div v-else-if="field.fieldType === 'mark'">
                <emojis :field="field"></emojis>
            </div>
            <div v-else-if="field.fieldType === 'smartComment'">
                <smart-comment :value="field" :card="card" :read-only="true" @readonlyUpdate="readonlyUpdate"></smart-comment>
            </div>
            <div v-else v-html="text"></div>
        </v-col>
    </v-row>
</template>

<script>
    import moment from "moment";
    import Emojis from "./Emojis";
    import SmartComment from "../../Inputs/SmartComment";

    export default {
        name: "SmartCommentView",
        props: ['field', 'infoAsColumn', 'card'],
        components: {
            SmartComment,
            Emojis
        },
        methods: {
            downloadFile(field) {
                window.open(field.uploadData.downloadUrl, '_blank');
            },
            readonlyUpdate(field) {
                this.$emit('readonlyUpdate', field);
            }
        },
        computed: {
            colorValues() {
                return this.field.colors.filter( colorData => {
                    return this.field.value && this.field.value.indexOf(colorData.value) !== -1;
                });
            },
            eventDate() {
                return moment(this.field.value).format('DD.MM.YYYY HH:mm');
            },
            text() {
                return this.field.text || '';
            },
            commentDate() {
                if (this.field.date) {
                    return moment(this.field.date).format('D MMMM HH:mm');
                }

                return '';
            },
            taskComplete() {
                if (this.field.complete) {
                    return Object.keys(this.field.complete).reduce( (totalComplete, userId) => {
                        return totalComplete && this.field.complete[userId];
                    }, true);
                }

                return false;
            }
        }
    }
</script>

<style scoped>
    .avatar-col {
        flex-grow: 0;
    }
</style>

<style>
    .mention-solo { color: var(--v-anchor-base); margin: 0 4px; }
    .date-time-container {
        padding: 0.1rem 0.375rem;
        background: #16d1a5;
        border-radius: 2px;
        margin: 0 4px;
    }
    .date-time-container::before {
        content: "\F0ED";
        display: inline-block;
        font: normal normal normal 24px/1 "Material Design Icons";
        font-size: 100%;
        margin-right: 10px;
    }
</style>