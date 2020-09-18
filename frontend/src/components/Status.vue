<template>
    <v-col class="status" cols="4">
        <div class="status-header d-flex justify-content-between">
            <v-chip color="" label>
                <v-text-field v-model="newTitle" v-if="isTitleEditing" dense hide-details></v-text-field>
                <span v-else>{{status.title}}</span>
                <v-btn v-if="isTitleEditing" small icon @click="commitStatusTitle" class="ml-2" ><v-icon>mdi-check</v-icon></v-btn>
                <v-btn v-else small icon @click="isTitleEditing = true" class="ml-2"><v-icon>mdi-pencil</v-icon></v-btn>
            </v-chip>
            <v-chip class="counter" label>{{cardCount}}</v-chip>

            <v-spacer class="fill" />

            <span class="status-icons d-flex justify-content-between">
                <v-btn icon text @click="sendAddCardEvent"><v-icon>mdi-plus</v-icon></v-btn>
                <v-menu bottom left offset-x>
                    <template v-slot:activator="{ on }">
                        <v-btn icon text v-on="on"><v-icon>mdi-dots-horizontal</v-icon></v-btn>
                    </template>
                    <v-list class="status-menu">
                        <!--v-list-item @click="$root.$emit('addStatusLeft', status)">
                            <v-list-item-icon>
                                <v-icon>mdi-table-column-plus-before</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Добавить этап перед</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="$root.$emit('addStatusRight', status)">
                            <v-list-item-icon>
                                <v-icon>mdi-table-column-plus-after</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Добавить этап после</v-list-item-title>
                        </v-list-item-->
                        <v-list-item @click="moveLeft" :disabled="isFirst">
                            <v-list-item-icon>
                                <v-icon v-if="isVerticalView">mdi-arrow-up</v-icon>
                                <v-icon v-else>mdi-arrow-left</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title v-if="isVerticalView">Сдвинуть вверх</v-list-item-title>
                            <v-list-item-title v-else>Сдвинуть влево</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="moveRight" :disabled="isLast">
                            <v-list-item-icon>
                                <v-icon v-if="isVerticalView">mdi-arrow-down</v-icon>
                                <v-icon v-else>mdi-arrow-right</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title v-if="isVerticalView">Сдвинуть вниз</v-list-item-title>
                            <v-list-item-title v-else>Сдвинуть вправо</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="$root.$emit('deleteStatus', status)">
                            <v-list-item-icon>
                                <v-icon>mdi-delete</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Удалить этап</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </span>
        </div>
        <ul class="status-cards">
            <div class="empty-status" v-if="cards.length === 0">
                Нет кандидатов на этом этапе
            </div>
            <card v-for="card in cards" :key="card.id"
                    :card="card"
                    :almost-finished="last"
                    :statuses="statuses"
                    :show-avatar="true"
                    :comment-index="0"
                    :small="vertical"
            ></card>
        </ul>
        <div class="status-footer" v-if="!hideFooter">
        </div>
    </v-col>
</template>

<script>
    import Card from "./Card.vue"
    import rfdc from "rfdc";
    const clone = rfdc();

    export default {
        name: 'Status',
        props: ['status', 'cards', 'last', 'statuses', 'hideFooter', 'vertical'],
        data() {
            return {
                isTitleEditing: false,
                newTitle: this.status.title,
            }
        },
        components: {
            Card
        },
        mounted() {
            this.enableStatusChangeOnEnter();
        },
        beforeDestroy () {
            this.disableStatusChangeOnEnter();
        },
        watch: {
            status: {
                handler() {
                    this.newTitle = this.status.title;
                },
                deep: true
            },
        },
        methods: {
            enableStatusChangeOnEnter() {
                document.onkeydown = e => {
                    if ( e.key === "Enter" && this.isTitleEditing) {
                        this.commitStatusTitle();
                    }
                }
            },
            disableStatusChangeOnEnter() {
                document.onkeydown = null;
            },

            sendAddCardEvent() {
                this.$root.$emit('addCard', this.status);
            },
            commitStatusTitle() {
                let changedStatus = clone(this.status);
                changedStatus.title = this.newTitle;
                this.$store.dispatch('updateBoardStatus', changedStatus);
                this.isTitleEditing = false;
            },
            moveLeft() {
                this.$store.dispatch('moveBoardStatusToIndex', {movedStatus: this.status, indexDelta: -1});
            },
            moveRight() {
                this.$store.dispatch('moveBoardStatusToIndex', {movedStatus: this.status, indexDelta: 1});
            }
        },
        computed: {
            board() {
                let boardId = this.status.boardId;
                return this.$store.getters.boardById(boardId);
            },
            cardCount() {
                return this.cards.length;
            },
            statusIndex() {
                if (!this.board) {
                    return false;
                }

                return this.board.statuses
                    ? this.board.statuses.findIndex( status => status.id === this.status.id )
                    : false;
            },
            isFirst() {
                return this.statusIndex === 0;
            },
            isLast() {
                let statusCount = this.board && this.board.statuses
                    ? this.board.statuses.length
                    : 0;

                return this.statusIndex === statusCount - 1;
            },
            isVerticalView() {
                return this.board.type === 'list';
            }
        }
    }
</script>

<style>
    .status-menu .v-list-item:not(.v-list-item--disabled) .v-icon {
        color: #261440!important;
    }

</style>

<style scoped>
    .status {
        display: inline-block;
        vertical-align: top;
        font-size: 0.9em;
        cursor: default;
        user-select: auto;

        /*padding: 0 32px 32px 0;
        min-width: 100vw!important;*/
        padding: 0 0 32px 0;
        min-width: 100%;

        pointer-events: none;
    }

    .empty-status {
        color: #6ca4b3;
        border: 2px dashed #6ca4b3;
        border-radius: 4px;
        padding: 8px;
        text-align: center;
        opacity: 0.5;
    }

    .status-header, .status-cards, .status-footer {
        pointer-events: all;
    }

    .wide .status {
        min-width: 375px!important;
        max-width: 400px!important;
    }

    .status-header {
        margin-bottom: 8px;
    }

    .status-cards {
        padding-left: 0;
    }

    .theme--light.v-chip {
        background: #e1eff3;
    }

    .v-chip.v-size--default {
        height: 24px!important;
    }

    .v-btn--icon.v-size--default {
        width: 24px!important;
        height: 24px!important;
        margin-left: 8px;

        color: #6ca4b3;
        font-size: 14px;
    }

    .v-chip.counter {
        background: none;
        color: #6ca4b3;
        font-weight: bold;
    }

    .status-footer .v-btn {
        /*color: #b5d2db;*/
        padding: 0 6px;
        font-size: 12px;
        height: 20px;
    }

    .v-btn--icon.v-size--small {
        width: 20px;
        height: 20px;
    }

    .v-btn--icon.v-size--small .v-icon {
        font-size: 16px;
        width: 18px;
        height: 18px;
    }

    .v-text-field.v-input--dense {
        padding: 0;
        font-size: 14px;
    }

    .v-text-field.v-input--dense .v-input input {
        max-height: 16px;

    }

    .v-text-field.v-input--dense .v-input input::selection {
        background: rgba(231,105,105,0.7);
    }
</style>