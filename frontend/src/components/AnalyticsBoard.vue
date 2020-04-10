<template>
    <v-content class="fill-height">
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
                <analytics-widget v-for="(record, index) in records"
                        :cards="cards"
                        :record="record"
                        :key="'widget-'+index"
                        :is-expanded="expandState[record.id]"
                        :value="filterValues[record.id]"
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
                        <analytics-widget v-for="(record, index) in records"
                                :cards="cards"
                                :record="record"
                                :key="'widget-'+index"
                                :is-expanded="expandState[record.id]"
                                :value="filterValues[record.id]"
                                @expand="updateFilterExpandState"
                                @input="updateFilterValues"
                                @stats="saveLocalStats"
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
    </v-content>
</template>

<script>
    import AnalyticsWidget from "./AnalyticsWidget";
    import Card from './Card';
    import moment from "moment";

    export default {
        name: "AnalyticsBoard",
        props: ['cards', 'statuses', 'board', 'isDesktop', 'filterDrawer'],
        components: {
            AnalyticsWidget,
            Card
        },
        data() {
            return {
                selectedWidget: false,
                allStats: {},
                filterValues: this.board.filterValues || {},
                expandState: this.board.expandState || {},
                filterIncrement: 0
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
            }
        },
        computed: {
            records() {
                let skipFieldTypes = ['file'];
                let skipEventTypes = ['reminder'];

                let fieldsHash = this.cards.reduce( (recordTypes, card) => {
                    if (card.content) {
                        card.content.forEach((record) => {
                            let recordId = record.linkToDefaultById || record.name;
                            let fieldIsAdded = typeof (recordTypes[recordId]) !== 'undefined';
                            let skipThisRecordType = record.type === 'comment';
                            let skipThisFieldType = record.type === 'field' && skipFieldTypes.indexOf(record.fieldType) !== -1;
                            let skipThisEventType = record.type === 'event' && skipEventTypes.indexOf(record.eventType) !== -1;

                            let skipThisRecord = fieldIsAdded || skipThisRecordType || skipThisFieldType || skipThisEventType;
                            let takeThisRecord = !skipThisRecord;

                            if (takeThisRecord) {
                                recordTypes[recordId] = {
                                    id: recordId,
                                    linkToDefaultById: record.linkToDefaultById || null,
                                    name: record.name,
                                    type: record.type,
                                    eventType: record.eventType || null,
                                    fieldType: record.fieldType || null
                                }
                            }
                        });
                    }

                    return recordTypes;
                }, {});

                return Object.values(fieldsHash);
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

                        let cardField = this.findFilteredField(card, filterFieldId);
                        let fieldMatches = typeof(cardField) === 'object'
                            ? this.fieldMatches(cardField, filterFieldSelectedItems)
                            : false;

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