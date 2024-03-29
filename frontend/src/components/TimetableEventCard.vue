<template>
    <div>
        <v-sheet elevation="2" v-if="isTask && isUserAuthor"  class="p-4 pb-1 mb-2 task-card">
            <v-btn icon @click="$root.$emit('selectCard', event.card.id)" class="event-button"><v-icon>mdi-file-edit-outline</v-icon></v-btn>
            <div class="task-text" v-html="item.task.text"></div>

            <v-list flat class="done-list">
                <v-list-item v-for="user in item.task.users" two-line :key="user.id">
                    <v-list-item-action>
                        <v-checkbox
                            :input-value="isTaskCompletedByUser(user)"
                            color="success"
                            @change="toggleCompleteTask(user)"
                        ></v-checkbox>
                    </v-list-item-action>

                    <v-list-item-content>
                        <v-list-item-title>{{user.fullName}}</v-list-item-title>
                        <v-list-item-subtitle>{{isTaskCompletedByUser(user) ? 'Готово' : 'Ожидает выполнения'}}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>

            <p class="d-flex flex-row justify-content-between">
                <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn class="mr-2" v-on="on">Позднее</v-btn>
                    </template>
                    <v-list>
                        <v-list-item @click="postponeTask('tomorrow')"><v-list-item-title>До завтра</v-list-item-title></v-list-item>
                        <v-list-item @click="postponeTask('2days')"><v-list-item-title>На два дня</v-list-item-title></v-list-item>
                        <v-list-item @click="postponeTask('nextWeek')"><v-list-item-title>До следующей недели</v-list-item-title></v-list-item>
                    </v-list>
                </v-menu>
                <v-btn color="success" @click="completeTask(loggedInUser)">Принять задачу</v-btn>
            </p>

        </v-sheet>
        <v-sheet elevation="2" v-else-if="isTask"  class="p-4 pb-1 mb-2 task-card">
            <v-btn icon @click="$root.$emit('selectCard', event.card.id)" class="event-button"><v-icon>mdi-file-edit-outline</v-icon></v-btn>
            <div class="task-text" v-html="item.task.text"></div>

            <p class="d-flex flex-row justify-content-between">
                <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn class="mr-2" v-on="on">Отложить</v-btn>
                    </template>
                    <v-list>
                        <v-list-item @click="postponeTask('tomorrow')"><v-list-item-title>До завтра</v-list-item-title></v-list-item>
                        <v-list-item @click="postponeTask('2days')"><v-list-item-title>На два дня</v-list-item-title></v-list-item>
                        <v-list-item @click="postponeTask('nextWeek')"><v-list-item-title>До следующей недели</v-list-item-title></v-list-item>
                    </v-list>
                </v-menu>
                <v-btn color="success" @click="completeTask(loggedInUser)">Завершить</v-btn>
            </p>
        </v-sheet>
        <v-sheet elevation="2" v-else-if="event.isComplete" class="p-2 pb-1 mb-2 event-card complete-event">
            <v-btn icon @click="$root.$emit('selectCard', event.card.id)" class="event-button"><v-icon>mdi-file-edit-outline</v-icon></v-btn>

            <h3><v-icon class="mr-2">mdi-check</v-icon>{{event.card.name}}</h3>
            <small class="text-muted">{{event.name}}</small>
        </v-sheet>
        <v-sheet elevation="2" v-else-if="event.isCardless"
                class="p-3 p-sm-4 mb-2 event-card"
                :class="{'old': isOldDate(event.value)}"
        >
            <v-btn icon @click="sendDeleteEvent" class="event-button"><v-icon>mdi-delete</v-icon></v-btn>
            <h3>{{event.name}}</h3>
            <p class="mb-0 d-flex justify-space-between">
                <span class="mr-4">{{humanTime(event.value)}}</span>
            </p>
            <p class="mt-2"><v-btn color="success" block @click="completeEvent(event)">Завершить</v-btn></p>
        </v-sheet>
        <v-sheet elevation="2" v-else
                class="p-3 p-sm-4 mb-2 event-card"
                :class="{'old': isOldDate(event.value)}"
                @click.self="isOldDate(event.value) ? null : $root.$emit('selectCard', event.card.id)"
        >
            <v-btn icon @click="$root.$emit('selectCard', event.card.id)" class="event event-button"><v-icon>mdi-file-edit-outline</v-icon></v-btn>

            <h3>{{event.card.name}}</h3>
            <p class="mb-0 d-flex justify-space-between">
                <span class="mr-4">{{humanTime(event.value)}}</span>
                <span>{{event.name}}</span>
                <span class="flex-fill"></span>
            </p>

            <p v-if="commentSent">
                <v-alert type="success">Комментарий отправлен</v-alert>
            </p>
            <p class="d-flex flex-row mt-2" v-else>
                <v-textarea outlined v-model="newComment.text" label="Новый комментарий" hide-details></v-textarea>
            </p>

            <p class="d-flex flex-row justify-content-between">
                <v-btn class="mr-2" small @click="sendComment">Комментировать</v-btn>
                <v-btn color="success" @click="completeEvent">Завершить</v-btn>
            </p>
        </v-sheet>
    </div>
</template>

<script>
    import moment from "moment";

    export default {
        name: "TimetableEventCard",
        props: ['event', 'user'],
        components: {
        },
        data() {
            return {
                item: this.event,
                commentSent: false,
                newComment: {
                    type: 'comment',
                    author: this.user,
                    text: null,
                },
            }
        },
        computed: {
            isTask() {
                return this.item.fieldType === 'task';
            },
            isUserAuthor() {
                return this.item.author.id === this.user.id;
            },
            loggedInUser() {
                return this.user;
            }
        },
        methods: {
            isOldDate(date) {
                return moment(date).isBefore( moment.now() );
            },
            humanTime(date) {
                return moment(date).format('HH:mm')
            },
            sendDeleteEvent() {
                this.$root.$emit('deleteCardlessEvent', this.event);
            },
            sendComment() {
                this.$root.$emit('addEventComment', this.newComment, this.event);
                this.commentSent = true;
            },
            completeEvent() {
                this.$root.$emit('completeEvent', this.event);
            },
            postponeTask(postponeCode) {
                let postponeDate = this.item.postponed && this.item.postponed[this.user.id]
                    ? moment(this.item.postponed[this.user.id])
                    : moment();
                
                switch (postponeCode) {
                    case 'tomorrow':
                        postponeDate = postponeDate.add(1, 'day');
                    break;
                    case '2days':
                        postponeDate = postponeDate.add(2, 'day');
                    break;
                    case 'nextWeek':
                        postponeDate = postponeDate.add(1, 'week').startOf('week');
                    break;
                }

                this.$root.$emit('postponeTask', this.item, postponeDate.toDate());
            },
            isTaskCompletedByUser(user) {
                let completedUserIds = this.item.task && this.item.complete
                    ? Object.keys(this.item.complete)
                    : [];
                return completedUserIds.indexOf(user.id) !== -1 && this.item.complete[user.id];
            },
            completeTask(user) {
                this.$root.$emit('completeTask', this.item, user);
            },
            toggleCompleteTask(user) {
                let newState = !this.isTaskCompletedByUser(user);
                this.$root.$emit('completeTask', this.item, user, newState);
            }
        }
    }
</script>

<style scoped>
    .event-button {
        position: absolute;
        top: 24px;
        right: 24px;
    }

    .complete-event {
        border: 3px solid #519839;
    }

    .event-card {
        position: relative;
    }

    .task-text {
        width: 90%;
    }
</style>

<style>
    .task-card .mention-solo,
    .task-card .date-time-container {
        margin: 0 4px;
        font-weight: bold;
    }

    .done-list .v-input--selection-controls__input input[role=checkbox] {
        cursor: default;
    }
</style>