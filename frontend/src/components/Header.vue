<template>
    <v-app-bar app fixed flat>
        <v-app-bar-nav-icon v-if="!isDesktop && !showBack" @click.stop="$emit('drawer')" />
        <v-btn icon v-if="showBack" @click.stop="$emit('back')"><v-icon>mdi-chevron-left</v-icon></v-btn>
        <v-toolbar-title :class="{'d-flex': isTitleEditing}">
            <v-text-field v-model="newTitle" v-if="isTitleEditing" @input="$emit('input', newTitle)"></v-text-field>
            <span v-else>{{ currentTitle || 'Без названия' }}</span>
            <v-btn v-if="allowTitleEdit && !isTitleEditing" icon @click="isTitleEditing = true"><v-icon>mdi-pencil</v-icon></v-btn>
            <v-btn v-if="allowTitleEdit && isTitleEditing" icon @click="isTitleEditing = false"><v-icon>mdi-check</v-icon></v-btn>
        </v-toolbar-title>
        <v-spacer/>

        <v-btn v-if="$route.name === 'board'" icon text @click="sendShareBoardEvent"><v-icon>mdi-share-variant</v-icon></v-btn>
        <v-btn v-if="$route.name === 'card'" icon text @click="sendShareCardEvent"><v-icon>mdi-share-variant</v-icon></v-btn>
        <slot name="menu">
            <v-menu bottom left offset-x @click.native.stop.prevent v-if="$route.name === 'card'" class="menu-top">
                <template v-slot:activator="{ on }">
                    <v-btn icon text v-on="on" @click.stop><v-icon>mdi-dots-vertical</v-icon></v-btn>
                </template>
                <card-menu :card="currentCard"></card-menu>
            </v-menu>
            <div v-else-if="$route.name === 'board'">
                <v-menu bottom left offset-x @click.native.stop.prevent class="menu-top">
                    <template v-slot:activator="{ on }">
                        <v-btn icon text v-on="on" @click.stop><v-icon>mdi-dots-vertical</v-icon></v-btn>
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

    export default {
        name: 'Header',
        props: ['isDesktop'],
        components: {
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
            currentTitle() {
                if (this.$route.title) {
                    return this.$route.title;
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
                    return this.currentBoard.title + ' - текст вакансии';
                }

                if (this.$route.name === 'board') {
                    return this.currentBoard.title;
                }

                return false;
            },
            showBack() {
                return this.$route.name === 'card' || this.$route.name === 'vacancy' || this.$route.name === 'board';
            },
            currentCard() {
                return this.$store.state.card.currentCard;
            },
            currentBoard() {
                return this.$route.params.boardId
                    ? this.$store.getters.boardById( this.$route.params.boardId )
                    : false;
            },
        }
    }
</script>
<style>
    .menu-top {
        z-index: 1000!important;
    }
</style>