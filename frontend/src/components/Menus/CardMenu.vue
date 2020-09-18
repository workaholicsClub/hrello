<template>
    <v-list class="card-menu">
        <v-list-item @click="sendShareEvent">
            <v-list-item-icon>
                <v-icon>mdi-share-variant</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Поделиться</v-list-item-title>
        </v-list-item>
        <v-list-item @click="sendMoveBackCardEvent">
            <v-list-item-icon>
                <v-icon>mdi-undo-variant</v-icon>
            </v-list-item-icon>
            <v-list-item-title>В предыдущий статус</v-list-item-title>
        </v-list-item>
        <v-list-item @click="sendMoveCardEvent">
            <v-list-item-icon>
                <v-icon>mdi-redo-variant</v-icon>
            </v-list-item-icon>
            <v-list-item-title>В следующий статус</v-list-item-title>
        </v-list-item>
        <v-list-item @click="sendFinishedListEvent">
            <v-list-item-icon>
                <v-icon>mdi-check-bold</v-icon>
            </v-list-item-icon>
            <v-list-item-title>В штат</v-list-item-title>
        </v-list-item>
        <v-list-item @click="sendWhiteListEvent">
            <v-list-item-icon>
                <v-icon>mdi-archive-arrow-down-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-title>В резерв</v-list-item-title>
        </v-list-item>
        <v-list-item @click="sendBlackListEvent">
            <v-list-item-icon>
                <v-icon>mdi-cancel</v-icon>
            </v-list-item-icon>
            <v-list-item-title>В черный список</v-list-item-title>
        </v-list-item>
        <v-list-item @click="sendDeleteCardEvent">
            <v-list-item-icon>
                <v-icon>mdi-delete</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Удалить</v-list-item-title>
        </v-list-item>
    </v-list>
</template>

<script>
    export default {
        name: "CardMenu",
        props: ['card'],
        methods: {
            sendShareEvent() {
                this.$root.$emit('shareCard', this.card);
            },
            sendMoveCardEvent() {
                this.$root.$emit('moveCardToNextStatus', this.card);
            },
            sendMoveBackCardEvent() {
                this.$root.$emit('moveCardToPrevStatus', this.card);
            },
            sendWhiteListEvent() {
                this.$root.$emit('moveCardToWhiteList', this.card);
            },
            sendBlackListEvent() {
                this.$root.$emit('moveCardToBlackList', this.card);
            },
            sendFinishedListEvent() {
                this.$root.$emit('moveCardToFinishedList', this.card);
            },
            sendDeleteCardEvent() {
                this.$root.$emit('deleteCard', this.card);
            },
        }
    }
</script>

<style>
    .card-menu .v-icon {
        color: #261440!important;
    }
</style>