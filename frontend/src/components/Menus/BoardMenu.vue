<template>
    <div class="white board-menu">
        <v-list>
            <v-list-item @click="sendCopyBoardEvent">
                <v-list-item-icon>
                    <v-icon>mdi-content-copy</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Создать вакансию по этому шаблону</v-list-item-title>
            </v-list-item>
            <v-list-item @click="sendArchiveBoardEvent">
                <v-list-item-icon>
                    <v-icon>mdi-archive-arrow-down-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Архивировать</v-list-item-title>
            </v-list-item>
            <v-list-item @click="sendDeleteBoardEvent">
                <v-list-item-icon>
                    <v-icon>mdi-delete</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Удалить</v-list-item-title>
            </v-list-item>
        </v-list>
    </div>
</template>

<script>
    export default {
        name: "BoardMenu",
        props: ['board'],
        data() {
            return {
            }
        },
        methods: {
            sendCopyBoardEvent() {
                this.$root.$emit('copyBoard', this.board);
            },
            sendArchiveBoardEvent() {
                this.$root.$emit('archiveBoard', this.board);
            },
            sendDeleteBoardEvent() {
                this.$root.$emit('deleteBoard', this.board);
            },
        }
    }
</script>

<style>
    .board-menu .v-icon {
        color: #261440!important;
    }
</style>