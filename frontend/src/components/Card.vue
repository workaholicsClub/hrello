<template>
    <v-card outlined elevation="2" min-width="300" @click="sendSelectCardEvent">
        <v-system-bar v-for="(color, index) in cardColor" :color="color" height="4" :key="index"></v-system-bar>
        <v-card-text>
            <v-row class="align-center justify-space-between">
                <h6 class="text--primary">{{card.name || 'Новый кандидат'}}</h6>
                <v-chip class="badge" color="primary" v-if="hasAlarm"><v-icon>mdi-alarm</v-icon></v-chip>
            </v-row>
            <v-row class="card-info align-center justify-space-between">
                <p class="text--primary">
                    {{pendingEventText}}
                </p>
                <v-spacer class="fill" />

                <div class="card-icons d-flex justify-content-between">
                    <v-menu v-if="isArchiveCard" v-model="showArchiveMenu" bottom left offset-x @click.native.stop.prevent>
                        <template v-slot:activator="{ on }">
                            <v-btn icon text v-on="on" @click.stop><v-icon>mdi-archive-arrow-up-outline</v-icon></v-btn>
                        </template>
                        <v-list-item v-for="board in boards" :key="board.id" @click="sendMoveToBoardEvent(board)">
                            <v-list-item-title>{{board.title}}</v-list-item-title>
                        </v-list-item>
                    </v-menu>
                    <v-menu v-else v-model="showActiveMenu" bottom left offset-x @click.native.stop.prevent>
                        <template v-slot:activator="{ on }">
                            <v-btn icon text v-on="on" @click.stop><v-icon>mdi-dots-horizontal</v-icon></v-btn>
                        </template>
                        <card-menu :card="card"></card-menu>
                    </v-menu>

                    <v-btn v-if="almostFinished && isActiveCard" icon depressed color="success" @click.stop="sendFinishedListEvent"><v-icon>mdi-check-bold</v-icon></v-btn>
                    <v-btn v-if="!almostFinished && isActiveCard" icon text @click.stop="sendMoveCardEvent"><v-icon>mdi-redo-variant</v-icon></v-btn>
                    <v-btn v-if="isActiveCard" icon text @click.stop="sendSelectCardEvent"><v-icon>mdi-pencil</v-icon></v-btn>
                </div>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import moment from 'moment';
    import {getDefaultColors} from "../unsorted/Helpers";
    import CardMenu from "./Menus/CardMenu";

    let defaultColors = getDefaultColors();

    export default {
        name: 'Card',
        props: ['card', 'almostFinished', 'boards', 'statuses'],
        components: {
            CardMenu
        },
        data() {
            return {
                showActiveMenu: false,
                showArchiveMenu: false
            }
        },
        methods: {
            sendMoveCardEvent() {
                this.$root.$emit('moveCardToNextStatus', this.card);
            },
            sendSelectCardEvent() {
                this.$root.$emit('selectCard', this.card.id);
            },
            sendFinishedListEvent() {
                this.$root.$emit('moveCardToFinishedList', this.card);
            },
            sendMoveToBoardEvent(board) {
                this.showMenu = false;
                this.showSubmenu = false;
                this.$root.$emit('moveCardToBoard', this.card, board);
            }
        },
        computed: {
            isArchiveCard() {
                return this.card.blacklist || this.card.whitelist || this.card.finishedlist || this.card.deleted || this.card.archive;
            },
            isActiveCard() {
                return !this.isArchiveCard;
            },
            cardColor() {
                let firstColorField = this.card.content
                    ? this.card.content.find(valueItem => valueItem.type === 'field' && valueItem.fieldType === 'color')
                    : false;

                if (!firstColorField) {
                    return null;
                }

                let colors = firstColorField.colors || defaultColors;

                let currentColors = colors
                                        .filter( colorItem => firstColorField.value && firstColorField.value.indexOf(colorItem.value) !== -1 )
                                        .map( colorItem => colorItem.color );
                return currentColors ? currentColors : null;
            },
            pendingEvent() {
                let cardHasContent = this.card.content && this.card.content instanceof Array;
                let cardHasGlobalFields = this.card.globalValues && this.card.globalValues instanceof Array;

                let fields = cardHasGlobalFields ? this.card.globalValues : [];
                if (cardHasContent) {
                    fields = fields.concat(this.card.content);
                }

                return fields.reduce( (foundEvent, content) => {
                            if (foundEvent === false) {

                                let isEvent = content.type === 'event';
                                let isNotOutdated = isEvent && (new Date(content.value) > Date.now());

                                if (isNotOutdated) {
                                    foundEvent = content;
                                }
                            }

                            return foundEvent;
                        }, false);
            },
            pendingEventText() {
                if (this.pendingEvent) {
                    let formattedDate = moment(this.pendingEvent.value).format('D MMM в HH:mm');
                    return this.pendingEvent.name + ', ' + formattedDate;
                }
                else {
                    return 'Предстоящих событий нет';
                }
            },
            isPendingEventToday() {
                if (!this.pendingEvent) {
                    return false;
                }

                return moment(this.pendingEvent.value).isSame(Date.now(), 'day');
            },
            hasAlarm() {
                return this.isPendingEventToday;
            }
        }
    }
</script>

<style scoped>
    .v-card {
        margin-bottom: 8px;
        cursor: pointer;
        min-width: 375px;
        max-width: 400px;
    }

    .v-card .elevation-2 {
        box-shadow: 0 3px 7px -2px rgba(0, 0, 0, 0.2) !important;
    }

    .v-card .v-card-text {
        padding: 34px;
    }

    .v-card p, .v-card h1, .v-card h2, .v-card h3, .v-card h4, .v-card h5, .v-card h6 {
        margin-bottom: 0;
    }

    .v-card h6 {
        font-size: 16px;
        margin-bottom: 2px;
    }

    .v-card .row {
        margin-left: 0;
        margin-right: 0;
    }

    .v-chip.badge {
        position: absolute;
        right: 0;
        margin-right: -12px;
        margin-top: -24px;
        padding: 2px;

        width: 22px;
        height: 22px;
        font-size: 14px;
    }

    .v-chip.badge .v-icon {
        font-size: 18px;
    }

    .v-card .card-info {
        font-size: 12px;
    }

    .v-btn--icon.v-size--default {
        width: 24px!important;
        height: 24px!important;
        margin-left: 8px;

        color: #6ca4b3;
        font-size: 14px;
    }

    .v-menu__content {
        background-color: #ffffff;
    }
</style>