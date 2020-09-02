<template>
    <div class="white">
        <v-list>
            <v-list-item v-if="board.type !== 'list'" @click="sendChangeBoardTypeEvent('list')">
                <v-list-item-icon>
                    <v-icon>mdi-view-list</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Включить вид списком</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="board.type !== 'kanban'" @click="sendChangeBoardTypeEvent('kanban')">
                <v-list-item-icon>
                    <v-icon>mdi-trello</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Включить канбан</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="board.type !== 'cli'" @click="sendChangeBoardTypeEvent('cli')">
                <v-list-item-icon>
                    <v-icon>mdi-console-line</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Включить командный вид</v-list-item-title>
            </v-list-item>

            <v-list-item @click="gotoBoardAnalytics" v-if="$route.name === 'board'">
                <v-list-item-icon>
                    <v-icon>mdi-chart-areaspline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Статистика</v-list-item-title>
            </v-list-item>
            <v-list-item @click="gotoBoard" v-if="$route.name === 'stats'">
                <v-list-item-icon>
                    <v-icon>mdi-view-grid</v-icon>
                </v-list-item-icon>
                <v-list-item-title>К списку кандидатов</v-list-item-title>
            </v-list-item>

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
                <v-list-item-title>Редактировать вакансию</v-list-item-title>
            </v-list-item>
            <v-list-item @click="sendCopyBoardEvent">
                <v-list-item-icon>
                    <v-icon>mdi-content-copy</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Копировать</v-list-item-title>
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
        <v-divider></v-divider>
        <v-list>
            <v-subheader>Показывать на карточке</v-subheader>
            <v-list-item>
                <v-list-item-action>
                    <v-switch v-model="showStatus.info" @change="updateShowStatus" @click.native.stop.prevent></v-switch>
                </v-list-item-action>
                <v-list-item-title>Данные</v-list-item-title>
            </v-list-item>
            <v-list-item>
                <v-list-item-action>
                    <v-switch v-model="showStatus.hashtags" @change="updateShowStatus" @click.native.stop.prevent></v-switch>
                </v-list-item-action>
                <v-list-item-title>#Хэштеги</v-list-item-title>
            </v-list-item>
            <v-list-item>
                <v-list-item-action>
                    <v-switch v-model="showStatus.achievements" @change="updateShowStatus" @click.native.stop.prevent></v-switch>
                </v-list-item-action>
                <v-list-item-title>$Медали</v-list-item-title>
            </v-list-item>
            <v-list-item>
                <v-list-item-action>
                    <v-switch v-model="showStatus.status" @change="updateShowStatus" @click.native.stop.prevent></v-switch>
                </v-list-item-action>
                <v-list-item-title>Этап</v-list-item-title>
            </v-list-item>
            <v-list-item>
                <v-list-item-action>
                    <v-switch v-model="showStatus.lastComment" @change="updateShowStatus" @click.native.stop.prevent></v-switch>
                </v-list-item-action>
                <v-list-item-title>Последний комментарий</v-list-item-title>
            </v-list-item>
            <v-list-item>
                <v-list-item-action>
                    <v-switch v-model="showStatus.buttons" @change="updateShowStatus" @click.native.stop.prevent></v-switch>
                </v-list-item-action>
                <v-list-item-title>Кнопки</v-list-item-title>
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
                showStatus: this.board.show || {},
            }
        },
        methods: {
            gotoBoardAnalytics() {
                this.$router.push({name: 'stats', params: {boardId: this.board.id}});
            },
            gotoBoard() {
                this.$router.push({name: 'board', params: {boardId: this.board.id}});
            },
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
            },
            updateShowStatus() {
                this.$store.dispatch('updateShowStatus', {board: this.board, newShowStatus: this.showStatus});
            }
        }
    }
</script>

<style scoped>

</style>