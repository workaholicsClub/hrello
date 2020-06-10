<template>
    <v-list>
        <v-list-item @click="sendShareEvent">
            <v-list-item-icon>
                <v-icon>mdi-share-variant</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Поделиться</v-list-item-title>
        </v-list-item>
        <v-list-item @click="sendToggleVacancyEvent">
            <v-list-item-icon>
                <v-icon>mdi-file-document-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Текст вакансии</v-list-item-title>
        </v-list-item>
        <v-list-item @click="sendCopyBoardEvent">
            <v-list-item-icon>
                <v-icon>mdi-content-copy</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Копировать доску</v-list-item-title>
        </v-list-item>
        <v-list-item @click="sendArchiveBoardEvent">
            <v-list-item-icon>
                <v-icon>mdi-archive-arrow-down-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Архивировать доску</v-list-item-title>
        </v-list-item>
        <v-list-item @click="sendDeleteBoardEvent">
            <v-list-item-icon>
                <v-icon>mdi-delete</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Удалить доску</v-list-item-title>
        </v-list-item>
    </v-list>
</template>

<script>
    export default {
        name: "BoardMenu",
        props: ['board'],
        methods: {
            sendShareEvent() {
                this.$root.$emit('shareBoard', this.board);
            },
            sendArchiveBoardEvent() {
                this.$root.$emit('archiveBoard', this.board);
            },
            sendDeleteBoardEvent() {
                this.$root.$emit('deleteBoard', this.board);
            },
            sendChangeBoardTypeEvent(newType) {
                this.$root.$emit('changeBoardType', newType, this.board);
            },
            sendCopyBoardEvent() {
                this.$root.$emit('copyBoard', this.board);
            },
            sendToggleVacancyEvent() {
                this.$emit('toggleVacancy', this.board);
            }
        }
    }
</script>

<style scoped>

</style>