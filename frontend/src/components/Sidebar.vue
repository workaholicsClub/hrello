<template>
    <div>
        <v-navigation-drawer
                v-model="isDrawerVisible"
                dark
                :app="isDesktop"
                :permanent="isDesktop"
                fixed
                hide-overlay
                :mini-variant="isMini"
                mini-variant-width="52"
        >
            <v-row>
                <v-col class="full-height d-flex flex-column pt-0">
                    <v-list>
                        <v-list-item>
                            <v-list-item-avatar color="white">
                                <v-img
                                        :src="user.imageUrl"
                                        height="34"
                                        contain
                                />
                            </v-list-item-avatar>
                        </v-list-item>
                        <v-list-item class="p-0" @click="toggleTimetable" :class="{'active': localActiveItem === 'timetable'}">
                            <v-list-item-action>
                                <v-btn icon outlined ><v-icon>mdi-calendar-blank-outline</v-icon></v-btn>
                            </v-list-item-action>
                            <v-list-item-title class="font-weight-light">
                                Расписание
                            </v-list-item-title>
                        </v-list-item>

                        <v-divider/>

                        <v-list-item
                                v-for="(board, index) in boards"
                                :key="'board'+index"
                                class="p-0"
                                :class="{'active': localActiveItem === 'board'+board.id}"
                                @click="toggleBoard(board)"
                        >
                            <v-list-item-action>
                                <v-btn icon outlined >{{getBoardTitle(board, index)}}</v-btn>
                            </v-list-item-action>
                            <v-list-item-title class="font-weight-light">
                                {{board.title}}
                            </v-list-item-title>
                        </v-list-item>

                        <v-list-item class="p-0" @click="$root.$emit('newBoard')">
                            <v-list-item-action>
                                <v-btn icon outlined ><v-icon>mdi-plus</v-icon></v-btn>
                            </v-list-item-action>
                            <v-list-item-title class="font-weight-light">
                                Добавить доску
                            </v-list-item-title>
                        </v-list-item>

                    </v-list>
                    <v-spacer class="fill" />
                    <v-list>
                        <v-list-item class="p-0" @click="toggleArchive" :class="{'active': localActiveItem === 'archive'}">
                            <v-list-item-action>
                                <v-btn icon><v-icon>mdi-archive-arrow-down-outline</v-icon></v-btn>
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
                        <v-divider/>
                        <v-list-item class="p-0">
                            <v-list-item-action  v-if="isDesktop">
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
    </div>
</template>
<script>
    export default {
        name: 'Sidebar',
        props: ['drawer', 'isDesktop', 'boards', 'user', 'activeItem'],
        data() {
            return {
                isDrawerVisible: false,
                mini: this.isDesktop,
                localActiveItem: this.activeItem
            }
        },
        methods: {
            getBoardTitle(board, index) {
                if (!board.title) {
                    return 'Д'+index;
                }

                let hasTwoWords = board.title.indexOf(' ') !== -1;
                let uppercaseTitle = board.title.toUpperCase();

                if (hasTwoWords) {
                    let words = uppercaseTitle.split(' ');
                    return words[0][0] + (words[1] && words[1][0]? words[1][0] : index);
                }

                return uppercaseTitle[0]+index;
            },
            toggleBoard(board) {
                this.localActiveItem = 'board'+board.id;
                this.$emit('changeBoard', board.id);
            },
            toggleTimetable() {
                this.localActiveItem = 'timetable';
                this.$emit('timetable');
            },
            toggleArchive() {
                this.localActiveItem = 'archive';
                this.$emit('archive', 'whitelist');
            }
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
            isMini() {
                return this.isDesktop ? this.mini : false;
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
    .v-navigation-drawer:not(.v-navigation-drawer--mini-variant) .v-btn--icon.v-size--default {
        min-width: 36px;
        margin-left: 12px;
    }
    .v-list-item.active:before {
        display: block;
        content: '\a';
        background: #16d1a5;
        width: 4px;
        height: 24px;
        opacity: 1;
        top: 50%;
        margin-top: -12px;
        border-radius: 0 4px 4px 0;
    }
    .v-navigation-drawer::-webkit-scrollbar,
    .v-navigation-drawer__content::-webkit-scrollbar {
        display: none;
    }
</style>