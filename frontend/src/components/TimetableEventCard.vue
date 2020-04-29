<template>
    <div>
        <v-sheet elevation="2" v-if="event.isComplete" class="p-2 pb-1 mb-2 event-card complete-event">
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
                commentSent: false,
                newComment: {
                    type: 'comment',
                    author: this.user,
                    text: null,
                },
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
</style>