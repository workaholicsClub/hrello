<template>
    <v-app-bar app fixed flat class="top-header">
        <v-app-bar-nav-icon v-if="!isDesktop && !showBack" @click.stop="$emit('drawer')" />
        <v-btn icon v-if="showBack" @click.stop="$emit('back')"><v-icon>mdi-chevron-left</v-icon></v-btn>
        <v-toolbar-title class="pl-3" :class="{'d-flex': isTitleEditing}">
            {{ currentTitle || 'Без названия' }}
            <small v-if="$route.name === 'card'" class="text--disabled text-caption d-block">Сохранено {{savedTime}} назад</small>
        </v-toolbar-title>
        <v-spacer/>

        <board-toolbar v-if="$route.name === 'board'" :board="currentBoard"></board-toolbar>
        <v-btn v-if="$route.name === 'card'" icon text @click="sendShareCardEvent"><v-icon>mdi-share-variant</v-icon></v-btn>
        <v-btn v-if="$route.name === 'stats'" icon text @click="sendShareBoardEvent"><v-icon>mdi-share-variant</v-icon></v-btn>
        <v-btn v-if="$route.name === 'stats'" icon text @click="gotoBoard"><v-icon>mdi-view-grid</v-icon></v-btn>
        <slot name="menu">
            <v-menu bottom left offset-x @click.native.stop.prevent v-if="$route.name === 'card'" class="menu-top">
                <template v-slot:activator="{ on }">
                    <v-btn icon text v-on="on" @click.stop><v-icon>mdi-dots-horizontal</v-icon></v-btn>
                </template>
                <card-menu :card="currentCard"></card-menu>
            </v-menu>
            <div v-else-if="$route.name === 'board' || $route.name === 'stats'">
                <v-menu bottom left offset-x @click.native.stop.prevent class="menu-top">
                    <template v-slot:activator="{ on }">
                        <v-btn icon text v-on="on" @click.stop><v-icon>mdi-dots-horizontal</v-icon></v-btn>
                    </template>
                    <board-menu
                            :board="currentBoard"
                            @toggleVacancy="toggleBoardVacancy(currentBoard)"
                    ></board-menu>
                </v-menu>
            </div>

        </slot>
    </v-app-bar>
</template>
<script>
    import CardMenu from "./Menus/CardMenu";
    import BoardMenu from "./Menus/BoardMenu";
    import BoardToolbar from "@/components/Menus/BoardToolbar";
    import moment from "moment";

    export default {
        name: 'Header',
        props: ['isDesktop'],
        components: {
            BoardToolbar,
            CardMenu,
            BoardMenu,
        },
        data() {
            return {
                isTitleEditing: false,
                newTitle: this.title,
            }
        },
        watch: {
            title() {
                this.newTitle = this.currentTitle;
            }
        },
        methods: {
            gotoBoardAnalytics() {
                this.$router.push({name: 'stats', params: {boardId: this.currentBoard.id}});
            },
            gotoBoard() {
                this.$router.push({name: 'board', params: {boardId: this.currentBoard.id}});
            },
            toggleFilterDrawer() {
                this.$store.commit('toggleFilterDrawer');
            },
            toggleBoardVacancy(board) {
                this.$router.push({name: 'vacancy', params: {boardId: board.id}});
            },
            sendShareBoardEvent() {
                this.$root.$emit('shareBoard', this.currentBoard);
            },
            sendShareCardEvent() {
                this.$root.$emit('shareCard', this.currentCard);
            },
        },
        computed: {
            allowTitleEdit() {
                return this.$route.name === 'board';
            },
            currentCardTitle() {
                if (!this.currentCard) {
                    return false;
                }

                let isDefaultName = /Кандидат \d+/.test(this.currentCard.name);
                let newCardTitle = 'Новый кандидат';
                if (isDefaultName) {
                    return newCardTitle;
                }

                return this.currentCard.name || newCardTitle;
            },
            savedTime() {
                let now = moment();
                let savedTime = moment(this.currentCard.lastUpdated);
                return moment.duration( now.diff(savedTime) ).humanize();
            },
            currentTitle() {
                if (this.$route.name === 'candidates') {
                    return 'Все кандидаты';
                }

                if (this.$route.name === 'home') {
                    return 'Все вакансии';
                }

                if (this.$route.name === 'card') {
                    return this.currentCardTitle;
                }

                if (this.$route.name === 'timetable') {
                    return 'Расписание';
                }

                if (this.$route.name === 'archive') {
                    let archiveTitles = {
                        whitelist: 'Резерв'
                    };

                    return archiveTitles[this.showArchive] || 'Архив';
                }

                if (this.$route.name === 'vacancy') {
                    return this.currentBoard.title + ' - Редактирование';
                }

                if (this.$route.name === 'stats') {
                    return this.currentBoard.title + ' - Статистика';
                }

                if (this.$route.name === 'board') {
                    return this.currentBoard.title;
                }

                if (this.$route.name === 'group') {
                    return this.currentGroup.name;
                }

                return false;
            },
            showBack() {
                let backRoutes = ['newBoard', 'group', 'vacancy', 'stats', 'card'];
                return backRoutes.indexOf(this.$route.name) !== -1;
            },
            currentCard() {
                return this.$store.state.card.currentCard;
            },
            currentBoard() {
                return this.$route.params.boardId
                    ? this.$store.getters.boardById( this.$route.params.boardId )
                    : false;
            },
            currentGroup() {
                return this.$route.params.groupId
                    ? this.$store.getters.group( this.$route.params.groupId )
                    : false;
            }
        }
    }
</script>
<style>
    .top-header .v-icon {
        color: #261440!important;
    }

    .theme--light.v-app-bar.v-toolbar.v-sheet {
        background-color: #fff;
        border-bottom: 1px solid #D3E3E8;
    }

    .menu-top {
        z-index: 1000!important;
    }
</style>