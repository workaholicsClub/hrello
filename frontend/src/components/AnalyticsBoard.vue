<template>
    <v-main class="fill-height">
        <v-navigation-drawer v-if="!isDesktop"
                :value="filterDrawer"
                absolute
                temporary
        >
            <v-list expand>
                <analytics-widget
                        :input-stats="statusStats"
                        :record="{id: 'status', name: 'Статус'}"
                        key="widget-status"
                        :is-expanded="expandState['status']"
                        :value="filterValues.status"
                        @expand="updateFilterExpandState"
                        @input="updateFilterValues"
                ></analytics-widget>
                <analytics-widget
                        :input-stats="hashtagStats"
                        :record="{id: 'hashtag', name: '#Хэштэги'}"
                        key="widget-hashtag"
                        :is-expanded="expandState['hashtag']"
                        :value="filterValues.hashtag"
                        @expand="updateFilterExpandState"
                        @input="updateFilterValues"
                ></analytics-widget>
                <analytics-widget
                        :input-stats="achievementStats"
                        :record="{id: 'achievement', name: '$Медали'}"
                        key="widget-achievement"
                        :is-expanded="expandState['achievement']"
                        :value="filterValues.achievement"
                        @expand="updateFilterExpandState"
                        @input="updateFilterValues"
                ></analytics-widget>
            </v-list>
        </v-navigation-drawer>
        <v-row class="mx-4">
            <v-col cols="4" v-if="isDesktop">
                <v-card class="mb-2">
                    <v-list expand>
                        <analytics-widget
                                :input-stats="statusStats"
                                :record="{id: 'status', name: 'Статус'}"
                                key="widget-status"
                                :is-expanded="expandState['status']"
                                :value="filterValues.status"
                                @expand="updateFilterExpandState"
                                @input="updateFilterValues"
                                @stats="saveLocalStats"
                        ></analytics-widget>
                        <analytics-widget
                                :input-stats="hashtagStats"
                                :record="{id: 'hashtag', name: '#Хэштэги'}"
                                key="widget-hashtag"
                                :is-expanded="expandState['hashtag']"
                                :value="filterValues.hashtag"
                                @expand="updateFilterExpandState"
                                @input="updateFilterValues"
                        ></analytics-widget>
                        <analytics-widget
                                :input-stats="achievementStats"
                                :record="{id: 'achievement', name: '$Медали'}"
                                key="widget-achievement"
                                :is-expanded="expandState['achievement']"
                                :value="filterValues.achievement"
                                @expand="updateFilterExpandState"
                                @input="updateFilterValues"
                        ></analytics-widget>
                    </v-list>
                </v-card>
            </v-col>
            <v-col class="cards-row" :cols="isDesktop ? 8 : 12" :key="filterIncrement">
                <Card v-for="card in filteredCards" :key="card.id" :card="card" :almost-finished="false" :statuses="statuses"></Card>
            </v-col>
        </v-row>
        <v-btn fab class="pink darken-1" dark bottom right fixed @click="sendAddNewCardEvent">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
    </v-main>
</template>

<script>
    import AnalyticsWidget from "./AnalyticsWidget";
    import Card from './Card';
    import moment from "moment";
    import {getCardTags, getUniqueTags} from "../unsorted/Helpers";

    export default {
        name: "AnalyticsBoard",
        components: {
            AnalyticsWidget,
            Card
        },
        data() {
            return {
                selectedWidget: false,
                allStats: {},
                filterValues: {},
                expandState: {},
                filterIncrement: 0
            }
        },
        mounted() {
            if (this.board) {
                this.filterValues = this.board.filterValues || {};
                this.expandState = this.board.expandState || {};
            }
        },
        methods: {
            sendAddNewCardEvent() {
                let newCardStatus = this.statuses[0];
                this.$root.$emit('addCard', newCardStatus);
            },
            saveLocalStats(newStats, record) {
                this.allStats[record.id] = newStats;
            },
            findFilteredField(card, filterFieldId) {
                if (!card.content) {
                    return false;
                }

                return card.content.find( currentRecord => {
                    let isNeededRecord = currentRecord.linkToDefaultById
                        ? currentRecord.linkToDefaultById === filterFieldId
                        : currentRecord.name === filterFieldId;

                    return isNeededRecord;
                });
            },
            timeRangeMatches(cardField, filterFieldSelectedItems) {
                let cardDate = moment(cardField.value);
                return filterFieldSelectedItems.reduce( (totalMatch, currentData) => {
                    let currentDate = moment(currentData.value);
                    return totalMatch || cardDate.isSameOrBefore(currentDate);
                }, false);
            },
            fieldMatches(cardField, filterFieldSelectedItems) {
                if (filterFieldSelectedItems.length === 0) {
                    return true;
                }

                if (cardField.type === 'event' && cardField.eventType !== 'reminder') {
                    return this.timeRangeMatches(cardField, filterFieldSelectedItems);
                }

                let cardValue = cardField.value || null;
                let filterValues = filterFieldSelectedItems.map( selectedItem => selectedItem.value );
                let fieldMatches = filterValues.indexOf(cardValue) !== -1;

                if (typeof (cardValue) === 'string' && cardValue.indexOf(',') !== -1) {
                    cardValue = cardValue.split(',');
                }

                if (cardValue instanceof Array) {
                    fieldMatches = cardValue.reduce( (totalMatch, currentValue) => {
                        return totalMatch || filterValues.indexOf(currentValue) !== -1;
                    }, false);
                }

                return fieldMatches;
            },
            updateFilterValues(newFilterValues, record) {
                this.$set(this.filterValues, record.id, newFilterValues);
                this.sendFilterUpdate();
            },
            sendFilterUpdate() {
                this.filterIncrement++;
                this.$root.$emit('filterBoard', this.filterValues, this.board);
            },
            updateFilterExpandState(newState, record) {
                this.$set(this.expandState, record.id, newState);
                this.sendFilterExpandState();
            },
            sendFilterExpandState() {
                this.$root.$emit('expandBoardFilter', this.expandState, this.board);
            },
            syncSavedFilter() {
                let newFilterRecords = this.allStats;
                let oldFilterRecords = this.filterValues;
                let filterIsUpdated = false;

                let updatedFilterValues = Object.keys(oldFilterRecords).reduce( (filterValues, fieldId) => {
                    let oldFieldValues = oldFilterRecords[fieldId];
                    let newFieldValues = newFilterRecords[fieldId];
                    let savedFieldRemoved = !newFieldValues;

                    if (savedFieldRemoved) {
                        return filterValues;
                    }

                    let syncedValues = oldFieldValues.filter( oldFieldValue => {
                        let newFieldValue = newFieldValues.find( currentFieldValue => currentFieldValue.value === oldFieldValue.value );
                        let oldFieldValueFoundInNewValues = Boolean(newFieldValue);
                        let oldValueIsRemoved = !oldFieldValueFoundInNewValues;

                        if (oldValueIsRemoved) {
                            filterIsUpdated = true;
                        }

                        return oldFieldValueFoundInNewValues;
                    });

                    filterValues[fieldId] = syncedValues;
                    return filterValues;
                }, {});

                if (filterIsUpdated) {
                    this.filterValues = updatedFilterValues;
                    this.sendFilterUpdate();
                }
            },
            getTagStats(tagname) {
                let tagStats = this.cards.reduce( (stats, card) => {

                    let tags = getUniqueTags( getCardTags(card, tagname) ).map( tag => tag.text );

                    tags.forEach( text => {
                        let statsItem = stats.find( item => item.title === text );
                        if (statsItem) {
                            statsItem.count++;
                        }
                        else {
                            stats.push({
                                id: text,
                                title: text,
                                value: text,
                                count: 1
                            });
                        }
                    });

                    return stats;
                }, []);

                return tagStats.sort( (a, b) => a.title.localeCompare(b.title) );
            }
        },
        computed: {
            board() {
                let boardId = this.$route.params.boardId;
                return this.$store.getters.boardById(boardId);
            },
            statuses() {
                return this.board ? this.board.statuses : [];
            },
            cards() {
                let boardId = this.$route.params.boardId;
                return this.$store.getters.cardsForBoardId(boardId);
            },
            filterDrawer() {
                return this.$store.state.showFilterDrawer;
            },
            isDesktop() {
                return this.$isDesktop();
            },
            statusStats() {
                return this.statuses.map( status => {
                    let statusCards = this.cards.filter( card => card.statusId === status.id );
                    return {
                        id: status.id,
                        title: status.title,
                        value: status.id,
                        count: statusCards.length
                    }
                });
            },
            hashtagStats() {
                return this.getTagStats('hashtag');
            },
            achievementStats() {
                return this.getTagStats('achievement');
            },
            filteredCards() {
                this.syncSavedFilter();

                let filterValues = this.filterValues;

                return this.cards.filter( card => {
                    return Object.keys(filterValues).reduce( (isCardNeeded, filterFieldId) => {
                        let filterFieldSelectedItems = filterValues[filterFieldId];

                        if (filterFieldSelectedItems.length === 0) {
                            return isCardNeeded;
                        }

                        if (filterFieldId === 'status') {
                            let selectedStatusIds = filterFieldSelectedItems.map( statusData => statusData.value );
                            let cardStatusMatches = selectedStatusIds.indexOf(card.statusId) !== -1;

                            return isCardNeeded && cardStatusMatches;
                        }

                        let isListField = ['hashtag', 'achievement'].indexOf(filterFieldId) !== -1;
                        let fieldMatches = false;

                        if (isListField) {
                            let selectedTags = filterFieldSelectedItems.map(item => item.value );
                            let cardTags = getCardTags(card, filterFieldId).map( tag => tag.text );
                            let selectedTagsInCard = cardTags.filter(tag => selectedTags.includes(tag));
                            fieldMatches = selectedTagsInCard.length > 0;
                        }

                        return isCardNeeded && fieldMatches;
                    }, true);
                });
            }
        }
    }
</script>

<style scoped>

</style>

<style>
    .cards-row .v-card {
        max-width: 100%!important;
    }
</style>