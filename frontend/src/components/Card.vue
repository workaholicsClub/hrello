<template>
    <v-card outlined elevation="2" min-width="300" @click="$root.$emit('selectCard', card.id)">
        <v-system-bar v-if="cardColor" :color="cardColor" height="4"></v-system-bar>
        <v-card-text>
            <v-row class="align-center justify-space-between">
                <h6 class="text--primary">
                    {{card.name}}
                </h6>
                <v-chip class="badge" color="primary" v-if="hasAlarm"><v-icon>mdi-alarm</v-icon></v-chip>
            </v-row>
            <v-row class="card-info align-center justify-space-between">
                <p class="text--primary">
                    {{pendingEventText}}
                </p>
                <v-spacer class="fill" />

                <div class="card-icons d-flex justify-content-between">
                    <v-menu bottom left offset-x @click.native.stop.prevent>
                        <template v-slot:activator="{ on }">
                            <v-btn icon text v-on="on" @click.stop><v-icon>mdi-dots-horizontal</v-icon></v-btn>
                        </template>
                        <v-list>
                            <v-list-item @click="sendMoveBackCardEvent">
                                <v-list-item-icon>
                                    <v-icon>mdi-undo-variant</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title>В предыдущий статус</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="sendMoveCardEvent">
                                <v-list-item-icon>
                                    <v-icon>mdi-redo-variant</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title>В следующий статус</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="sendFinishedListEvent">
                                <v-list-item-icon>
                                    <v-icon>mdi-check-bold</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title>В штат</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="sendWhiteListEvent">
                                <v-list-item-icon>
                                    <v-icon>mdi-account-box-multiple-outline</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title>В архив кандидатов</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="sendBlackListEvent">
                                <v-list-item-icon>
                                    <v-icon>mdi-delete</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title>В черный список</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>

                    <v-btn v-if="almostFinished" icon depressed color="success" @click.stop="sendFinishedListEvent"><v-icon>mdi-check-bold</v-icon></v-btn>
                    <v-btn v-else icon text @click.stop="sendMoveCardEvent"><v-icon>mdi-redo-variant</v-icon></v-btn>
                </div>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import moment from 'moment';
    import {getGlobalField} from "../unsorted/Helpers";

    export default {
        name: 'Card',
        props: ['card', 'almostFinished', 'globalFields'],
        components: {
        },
        data() {
            return {
            }
        },
        methods: {
            sendMoveCardEvent() {
                this.$root.$emit('moveCardToNextStatus', this.card);
            },
            sendMoveBackCardEvent() {
                this.$root.$emit('moveCardToPrevStatus', this.card);
            },
            sendWhiteListEvent() {
                this.$root.$emit('moveCardToWhiteList', this.card);
            },
            sendBlackListEvent() {
                this.$root.$emit('moveCardToBlackList', this.card);
            },
            sendFinishedListEvent() {
                this.$root.$emit('moveCardToFinishedList', this.card);
            },
        },
        computed: {
            cardColor() {
                let localValues = this.card.content || [];
                let globalValues = this.card.globalValues || [];

                let globalColorValues = globalValues.filter(globalItem => {
                    if (globalItem.type !== 'field') {
                        return false;
                    }

                    let fieldData = getGlobalField(globalItem.fieldId, this.globalFields);
                    return fieldData.fieldType === 'color';
                });

                let hasGlobalColors = globalColorValues.length > 0;
                let colorValue = false;
                let colors = false;

                if (hasGlobalColors) {
                    colorValue = globalColorValues[0];
                    colors = getGlobalField(colorValue.fieldId, this.globalFields).colors;
                }
                else {
                    let localColorValues = localValues.filter(valueItem => valueItem.type === 'field' && valueItem.fieldType === 'color');
                    let hasLocalColors = localColorValues.length > 0;

                    if (hasLocalColors) {
                        colorValue = localColorValues[0];
                        colors = colorValue.colors;
                    }
                }

                if (!colorValue || !colors) {
                    return null;
                }

                let currentColorItem = colors.filter( colorItem => colorItem.value === colorValue.value )[0];
                return currentColorItem ? currentColorItem.color : null;
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
</style>