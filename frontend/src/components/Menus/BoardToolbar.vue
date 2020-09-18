<template>
    <div class="board-toolbar d-flex align-items-center">
        <v-btn-toggle :value="typeIndex" dense group mandatory class="grey-icons">
            <v-btn small icon @click="sendChangeBoardTypeEvent('kanban')"><v-icon>mdi-trello</v-icon></v-btn>
            <v-divider vertical></v-divider>
            <v-btn small icon @click="sendChangeBoardTypeEvent('list')"><v-icon>mdi-view-list</v-icon></v-btn>
            <v-divider vertical></v-divider>
            <v-btn small icon @click="sendChangeBoardTypeEvent('cli')"><v-icon>mdi-console-line</v-icon></v-btn>
        </v-btn-toggle>
        <v-menu bottom left offset-x @click.native.stop.prevent class="menu-top">
            <template v-slot:activator="{ on }">
                <v-btn v-on="on" text class="ml-2">
                    Вид
                    <v-icon right>mdi-menu-swap</v-icon>
                </v-btn>
            </template>
            <board-view-menu :board="board"></board-view-menu>
        </v-menu>
        <v-btn icon @click="gotoBoardAnalytics" v-if="$route.name === 'board'"><v-icon>mdi-chart-areaspline</v-icon></v-btn>
        <v-btn icon @click="gotoBoard" v-if="$route.name === 'stats'"><v-icon>mdi-view-grid</v-icon></v-btn>
        <v-btn icon @click="sendShareEvent"><v-icon>mdi-share-variant</v-icon></v-btn>
        <v-btn icon @click="gotoBoardEdit"><v-icon>mdi-pencil</v-icon></v-btn>
    </div>
</template>

<script>
    import BoardViewMenu from "@/components/Menus/BoardViewMenu";
    export default {
        name: "BoardToolbar",
        props: ['board'],
        components: {BoardViewMenu},
        data() {
            return {
                activeView: false,
            }
        },
        methods: {
            sendChangeBoardTypeEvent(newType) {
                this.$root.$emit('changeBoardType', newType, this.board);
            },
            gotoBoardEdit() {
                this.$router.push({name: 'vacancy', params: {boardId: this.board.id}});
            },
            sendShareBoardEvent() {
                this.$root.$emit('shareBoard', this.currentBoard);
            },
            gotoBoardAnalytics() {
                this.$router.push({name: 'stats', params: {boardId: this.board.id}});
            },
            gotoBoard() {
                this.$router.push({name: 'board', params: {boardId: this.board.id}});
            },
            sendShareEvent() {
                this.$root.$emit('shareBoard', this.board);
            },
        },
        computed: {
            typeIndex() {
                return ['kanban', 'list', 'cli'].indexOf( this.board.type );
            }
        }
    }
</script>

<style>
    .top-header .grey-icons .v-icon {
        color: rgba(0, 0, 0, 0.54)!important;
    }

    .top-header .v-btn:not(.v-btn--text):not(.v-btn--outlined).v-btn--active:before {
        opacity: 0;
    }

    .top-header .v-btn-toggle > .v-btn.v-btn--active,
    .top-header .v-btn-toggle > .v-btn.v-btn--active .v-btn__content,
    .top-header .grey-icons .v-btn.v-btn--active .v-btn__content .v-icon {
        color: #16D1A5!important;
    }

    .top-header .v-divider--vertical {
        margin: 8px 0;
    }
</style>