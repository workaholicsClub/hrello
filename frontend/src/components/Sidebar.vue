<template>
    <v-navigation-drawer
            v-model="isDrawerVisible"
            :permanent="isDesktop"
            width="300px"
            app
            dark
    >
        <v-row class="fill-height" no-gutters>
            <v-navigation-drawer
                    dark
                    fixed
                    permanent
                    hide-overlay
                    class="icon-bar"
                    mini-variant
                    mini-variant-width="52"
            >
                <v-row>
                    <v-col class="full-height d-flex flex-column pt-0">
                        <v-list>
                            <v-list-item class="p-0" @click="toggleBoardList" :class="{'active': isActive('board', false)}" v-ripple="false">
                                <v-list-item-action>
                                    <v-btn icon :rounded="isActive('board', false)">
                                        <v-icon>mdi-view-grid</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item>
                            <v-list-item class="p-0" @click="toggleTimetable" :class="{'active': isActive('timetable')}" v-ripple="false">
                                <v-list-item-action>
                                    <v-badge :content="todayEvents" :value="todayEvents" color="error" overlap>
                                        <v-btn icon :rounded="isActive('timetable')">
                                            <v-icon>mdi-calendar-blank-outline</v-icon>
                                        </v-btn>
                                    </v-badge>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                        <v-spacer class="fill" />
                        <v-list>
                            <v-list-item class="p-0" @click="toggleArchive" :class="{'active': isActive('archive')}">
                                <v-list-item-action>
                                    <v-btn icon :rounded="isActive('archive')">
                                        <v-icon>mdi-archive-arrow-down-outline</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                                <v-list-item-title class="font-weight-light">
                                    Показать резерв
                                </v-list-item-title>
                            </v-list-item>
                            <v-divider/>
                            <v-list-item class="p-0" @click="$emit('logout')">
                                <v-list-item-action>
                                    <v-btn icon><v-icon>mdi-logout</v-icon></v-btn>
                                </v-list-item-action>
                                <v-list-item-title class="font-weight-light">
                                    Выход
                                </v-list-item-title>
                            </v-list-item>
                            <v-divider v-if="!isDesktop"/>
                            <v-list-item class="p-0" v-if="!isDesktop">
                                <v-list-item-action>
                                    <v-btn icon @click.stop="mini = !mini">
                                        <v-icon v-if="isMini">mdi-chevron-double-right</v-icon>
                                        <v-icon v-else>mdi-chevron-double-left</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                    </v-col>
                </v-row>
            </v-navigation-drawer>
            <v-list class="grow right-sidebar" dark dense>
                <v-list-item class="d-flex flex-column align-items-center no-bottom-padding">
                    <v-list-item-avatar
                            color="white"
                            size="76"
                    >
                        <v-img
                                :src="user.imageUrl"
                                contain
                        />
                    </v-list-item-avatar>
                    <p class="mb-0">
                        {{user.fullName}}
                    </p>
                    <v-row class="stats">
                        <v-col cols="6">
                            <em>{{countVacancies}}</em>
                            <small>вакансий</small>
                        </v-col>
                        <v-col cols="6">
                            <em>{{countCards}}</em>
                            <small>кандидатов</small>
                        </v-col>
                    </v-row>
                </v-list-item>


                <v-divider/>


                <v-list-item class="p-0" :class="{'active': isActive('home')}" @click="toggleBoardList">
                    <v-list-item-action>
                        <v-icon small>mdi-at</v-icon>
                    </v-list-item-action>
                    <v-list-item-title class="font-weight-light">
                        Все вакансии
                    </v-list-item-title>
                    <v-list-item-action>
                        <v-btn x-small icon outlined @click.stop="gotoNewBoard"><v-icon small>mdi-plus</v-icon></v-btn>
                    </v-list-item-action>
                </v-list-item>
                <v-list-item class="p-0" :class="{'active': isActive('candidates')}" @click="toggleCandidateList">
                    <v-list-item-action>
                        <v-icon small>mdi-at</v-icon>
                    </v-list-item-action>
                    <v-list-item-title class="font-weight-light">
                        Все кандидаты
                    </v-list-item-title>
                </v-list-item>
                <v-list-item
                        v-for="(board, index) in boards"
                        :key="'board'+index"
                        class="p-0"
                        :class="{'active': isActive('board', board.id)}"
                        @click="toggleBoard(board)"
                >
                    <v-list-item-action>
                        <v-icon small>mdi-lock</v-icon>
                    </v-list-item-action>
                    <v-list-item-title class="font-weight-light">
                        {{board.title}}
                    </v-list-item-title>
                </v-list-item>
                <v-list-item
                        v-for="(group, index) in groups"
                        :key="'group'+index"
                        class="p-0"
                        :class="{'active': isActive('group', group.id)}"
                        @click="toggleGroup(group)"
                >
                    <v-list-item-action>
                        <v-icon small>mdi-pound</v-icon>
                    </v-list-item-action>
                    <v-list-item-title class="font-weight-light">
                        {{group.name}}
                    </v-list-item-title>
                </v-list-item>

                <v-list-item class="p-0 muted" @click="gotoNewBoard">
                    <v-list-item-action>
                        <v-icon>mdi-plus</v-icon>
                    </v-list-item-action>
                    <v-list-item-title class="font-weight-light">
                        Добавить вакансию
                    </v-list-item-title>
                </v-list-item>

            </v-list>
        </v-row>
    </v-navigation-drawer>
</template>
<script>
    export default {
        name: 'Sidebar',
        props: ['drawer', 'isDesktop', 'boards', 'user', 'activeItem'],
        data() {
            return {
                isDrawerVisible: false,
                localActiveItem: this.activeItem
            }
        },
        methods: {
            isActive(checkItemCode, checkItemId) {
                if (checkItemCode === 'board') {
                    return checkItemId === false
                        ? (this.$route.name === 'home' || this.$route.name === 'board')
                        : this.$route.params.boardId === checkItemId
                }

                if (checkItemCode === 'group') {
                    return checkItemId === false
                        ? (this.$route.name === 'home' || this.$route.name === 'group')
                        : this.$route.params.groupId === checkItemId
                }

                return this.$route.name === checkItemCode;
            },
            toggleBoard(board) {
                this.localActiveItem = 'board'+board.id;
                this.$emit('changeBoard', board.id);
            },
            toggleGroup(group) {
                this.$router.push({name: 'group', params: {groupId: group.id}});
            },
            toggleTimetable() {
                this.localActiveItem = 'timetable';
                this.$router.push({name: 'timetable'});
            },
            toggleBoardList() {
                this.localActiveItem = 'home';
                this.$router.push({name: 'home'});
            },
            toggleCandidateList() {
                this.localActiveItem = 'candidates';
                this.$router.push({name: 'candidates'});
            },
            toggleArchive() {
                this.localActiveItem = 'archive';
                this.$emit('archive', 'whitelist');
            },
            gotoNewBoard() {
                this.$router.push({name: 'newBoard'});
            },
        },
        watch: {
            activeItem() {
                if (this.activeItem !== false) {
                    this.localActiveItem = this.activeItem;
                }
            },
            drawer() {
                this.isDrawerVisible = this.drawer;
            },
            isDrawerVisible() {
                this.$emit('drawer', this.isDrawerVisible);
            }
        },
        computed: {
            groups() {
                this.$store.state.user.currentUser; //Чтобы вью пересчитывала свойства при изменении пользователя
                return this.$store.getters.savedGroups;
            },
            isMini() {
                return this.isDesktop ? this.mini : false;
            },
            todayEvents() {
                let user = this.$store.state.user.currentUser;
                let today = Date.now();
                let events = this.$store.getters.eventsByDateForUser(today, user.id);
                let overdueCards = this.$store.getters.getOvertimeCards;
                return events.length + overdueCards.length;
            },
            countCards() {
                return this.$store.state.card.cards.length;
            },
            countVacancies() {
                return this.boards ? this.boards.length : 0;
            }
        }
    }
</script>
<style scoped>
    .theme--dark.v-navigation-drawer {
        background-color: #261440;
    }
    .theme--dark.v-divider {
        border-color: #1d7272;
        margin-left: 10px;
        margin-right: 10px;
    }
    .spacer.fill {
        flex: 1 1 auto !important;
    }
    .row, .col {
        height: 100%;
    }
    .icon-bar .v-btn--icon {
        margin-left: 0!important;
    }

    .right-sidebar {
        padding-left: 52px;
    }

    .v-navigation-drawer:not(.v-navigation-drawer--mini-variant) .v-btn--icon.v-size--default {
        min-width: 36px;
        margin-left: 12px;
    }

    .v-list-item.active {
        background: #16d1a5;
        color: #261440!important;
    }

    .v-list-item.active .theme--dark.v-icon,
    .theme--dark.v-list-item.active:not(.v-list-item--active):not(.v-list-item--disabled) {
        color: #261440!important;
    }

    .v-list-item.active .v-btn--outlined {
        border: thin solid #261440!important;
    }

    .v-navigation-drawer::-webkit-scrollbar,
    .v-navigation-drawer__content::-webkit-scrollbar {
        display: none;
    }

    .right-sidebar .v-list-item__avatar:first-child {
        margin-right: 0!important;
    }

    .right-sidebar .v-list-item {
        min-height: 28px!important;
    }

    .right-sidebar .v-list-item__action:first-child {
        margin-right: 0!important;
        margin-left: 16px!important;
    }
    .right-sidebar .v-list-item__action {
        min-width: 20px!important;
        font-size: 14px!important;
        margin: 0!important;
    }
    .right-sidebar .v-list-item__action:last-of-type:not(:only-child) {
        margin-right: 16px!important;
    }
    .right-sidebar .v-list-item__action .v-icon {
        font-size: 14px!important;
    }
    .right-sidebar .v-list-item__title {
        font-size: 14px!important;
    }

    .right-sidebar .muted.v-list-item,
    .right-sidebar .muted.v-list-item .v-icon {
        color: #aaa !important;
    }

    .right-sidebar .stats .col {
        text-align: center;
        padding-top: 0;
        padding-bottom: 0;
        margin-top: 10px;
    }
    .right-sidebar .stats .col:first-child {
        border-right: 1px solid #aaa;
    }
    .right-sidebar .stats em {
        display: block;
        font-size: 20px;
        line-height: 20px;
        color: #16d1a5;
        font-style: normal;
        font-weight: 500;
    }
    .right-sidebar .stats small {
        color: #aaa !important;
    }
    .right-sidebar .v-list-item.no-bottom-padding::after {

    }
</style>