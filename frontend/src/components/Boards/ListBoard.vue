<template>
    <v-main class="fill-height">
        <v-row class="mx-2 mx-md-4">
            <v-col cols="12" md="4">
                <h5>Фильтры</h5>
                <div class="mb-2">
                    <v-list expand class="filter">
                        <analytics-widget v-if="hasStatuses"
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

                        <div v-if="hasBoard">
                            <analytics-widget v-for="fieldName in activeFields" :key="fieldName"
                                    :input-stats="fieldStats(fieldName)"
                                    :record="{id: fieldName, name: fieldName}"
                                    :is-expanded="expandState[fieldName]"
                                    :value="filterValues[fieldName]"
                                    :show-as-select="true"
                                    @expand="updateFilterExpandState"
                                    @input="updateFilterValues"
                            ></analytics-widget>
                        </div>
                        <div v-else>
                            <analytics-widget
                                    :input-stats="boardStats"
                                    :record="{id: 'board', name: 'Вакансии'}"
                                    key="widget-board"
                                    :is-expanded="expandState['board']"
                                    :value="filterValues.board"
                                    @expand="updateFilterExpandState"
                                    @input="updateFilterValues"
                            ></analytics-widget>
                        </div>

                        <v-text-field
                                ref="searchField"
                                outlined
                                clearable
                                append-icon="mdi-magnify"
                                placeholder="Полный поиск по карточкам и резюме"
                                hint="Нажмите / для выбора"
                                persistent-hint
                                v-model="searchText"
                                class="mt-4 mr-4 white"
                        ></v-text-field>

                        <div v-if="!hasBoard && !hasGroup">
                            <new-group-dialog @newGroup="handleNewGroup"></new-group-dialog>
                        </div>

                    </v-list>
                </div>
            </v-col>
            <v-col class="cards-row" cols="12" md="8">
                <div class="d-flex mb-2">
                    <span class="flex-fill">Показано результатов: {{filteredCards.length}}</span>

                    <v-menu bottom offset-y v-if="hasBoard">
                        <template v-slot:activator="{ on }">
                            <v-btn text :loading="isResumeUploading" v-on="on"><v-icon>mdi-plus</v-icon> Добавить кандидата</v-btn>
                        </template>
                        <v-list>
                            <v-list-item @click="selectFile">
                                <v-list-item-title>Загрузить резюме</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="sendAddNewCardEvent">
                                <v-list-item-title>Добавить пустую карточку</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
                <div v-if="hasStatuses">
                    <div v-for="(group, index) in filteredCardsGroupedByStatus" :key="group.status.id">
                        <status :key="group.status.id"
                                :status="group.status"
                                :last="index === filteredCardsGroupedByStatus.length-1"
                                :cards="group.cards"
                                :hide-footer="true"
                                :vertical="false"
                                @input="updateStatusTitle"
                        ></status>
                    </div>
                    <div class="new-status">
                        <v-btn text @click="addNewStatus"><v-icon>mdi-plus</v-icon> Добавить этап</v-btn>
                    </div>

                </div>
                <div v-else>
                    <card v-for="card in filteredCards" :key="card.id"
                            :card="card"
                            :almost-finished="false"
                            :show-avatar="true"
                            :comment-index="0"
                            :show-board="!hasBoard"
                            :small="false"
                    ></card>
                </div>
            </v-col>
        </v-row>
        <input type="file" style="display: none" ref="fileInput" @change="addNewResume">
    </v-main>
</template>

<script>
    import AnalyticsWidget from "../AnalyticsWidget";
    import NewGroupDialog from "@/components/Dialogs/NewGroupDialog";
    import Status from "../Status.vue";
    import Card from '../Card';
    import moment from "moment";
    import {getCardTags, getUniqueTags} from "../../unsorted/Helpers";
    import BoardsCommon from "@/mixins/BoardsCommon";

    export default {
        name: "ListBoard",
        components: {
            AnalyticsWidget,
            Status,
            Card,
            NewGroupDialog
        },
        mixins: [BoardsCommon],
        data() {
            return {
                selectedWidget: false,
                allStats: {},
                filterValues: {},
                expandState: {},
                filterIncrement: 0,
                isResumeUploading: false,
                searchText: '',
            }
        },
        mounted() {
            if (this.board) {
                this.filterValues = this.board.filterValues || {};
                this.expandState = this.board.expandState || {};
            }

            this.enableKeyFocus();
            this.reloadFilter();
        },
        beforeDestroy () {
            this.disableKeyFocus();
        },
        watch: {
            group: {
                deep: true,
                handler() {
                    this.reloadFilter();
                }
            },
            board: {
                deep: true,
                handler() {
                    this.reloadFilter();
                }
            },
            user: {
                deep: true,
                handler() {
                    this.reloadFilter();
                }
            },
        },
        methods: {
            addNewStatus() {
                this.$store.dispatch('addBoardStatus', {board: this.board, newStatus: false})
            },
            reloadFilter() {
                if (this.group && this.user) {
                    let {filterValues, searchText} = this.getInitialFilter();
                    this.filterValues = filterValues;
                    this.searchText = searchText;
                    this.expandState = Object.keys(filterValues).reduce( (state, key) => {
                        state[key] = true;
                        return state;
                    }, {}) || {};
                }

                if (this.board) {
                    if (this.board.filterValues) {
                        this.filterValues = this.board.filterValues;
                    }
                    if (this.board.expandState) {
                        this.expandState = this.board.expandState;
                    }
                }
            },
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
                if (this.hasBoard) {
                    this.$root.$emit('filterBoard', this.filterValues, this.board);
                }
            },
            updateFilterExpandState(newState, record) {
                this.$set(this.expandState, record.id, newState);
                this.sendFilterExpandState();
            },
            sendFilterExpandState() {
                if (this.hasBoard) {
                    this.$root.$emit('expandBoardFilter', this.expandState, this.board);
                }
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
            },
            groupByStatus(cards) {
                if (!this.statuses) {
                    return [];
                }

                let statuses = this.statuses;

                if (this.filterValues.status && this.filterValues.status.length > 0) {
                    let selectedStatusIds = this.filterValues.status.map( status => status.id );
                    statuses = statuses.filter( status => selectedStatusIds.indexOf( status.id ) !== -1 );
                }

                return statuses ? statuses.map(status => {
                    return {
                        status,
                        cards: cards.filter( card => card.statusId === status.id )
                    }
                }) : [];
            },
            updateStatusTitle(changedStatus, newTitle) {
                changedStatus.title = newTitle;
                this.$root.$emit('updateStatus', changedStatus);
            },
            fieldStats(fieldName) {
                return this.cards ? this.cards.reduce( (values, card) => {
                    let valueData = card.pinnedFieldValues
                        ? card.pinnedFieldValues.find( pinnedField => pinnedField.fieldName === fieldName )
                        : null;


                    if (valueData) {
                        let currentValue = valueData.value;
                        let valueStats = values.find( stat => stat.title === currentValue );

                        if (valueStats) {
                            valueStats.count++;
                        }
                        else {
                            valueStats = {
                                id: currentValue,
                                title: currentValue,
                                value: currentValue,
                                count: 1
                            }

                            values.push(valueStats);
                        }
                    }

                    return values;
                }, []) : [];
            },
        },
        computed: {
            isDesktop() {
                return this.$isDesktop();
            },
            statusStats() {
                return this.statuses ? this.statuses.map( status => {
                    let statusCards = this.cards.filter( card => card.statusId === status.id );
                    return {
                        id: status.id,
                        title: status.title,
                        value: status.id,
                        count: statusCards.length
                    }
                }) : [];
            },
            activeFields() {
                let defaultActiveFields = ['Город'];
                let userAddedFields = this.$store.getters.activePinnedFields(this.board)
                    .filter( field => field.autoAdded !== true )
                    .map( field => field.name );
                return userAddedFields.concat( defaultActiveFields );
            },
            hashtagStats() {
                return this.getTagStats('hashtag');
            },
            achievementStats() {
                return this.getTagStats('achievement');
            },
            boardStats() {
                let boards = this.$store.state.boards || [];
                return boards.map( board => {
                    let boardCards = this.$store.getters.cardsForBoardId(board.id);
                    return {
                        id: board.id,
                        title: board.title,
                        value: board.id,
                        count: boardCards.length,
                    }
                });
            },
            filteredCards() {
                this.board; //Чтобы при изменениях отображения перерисовывать карты
                this.syncSavedFilter();

                let textMatches = true;
                let filterValues = this.filterValues;

                return this.cards.filter( card => {
                    let anyFieldMatches = Object.keys(filterValues).reduce( (isCardNeeded, filterFieldId) => {
                        let filterFieldSelectedItems = filterValues[filterFieldId];

                        if (filterFieldSelectedItems.length === 0) {
                            return isCardNeeded;
                        }

                        if (filterFieldId === 'status') {
                            let selectedStatusIds = filterFieldSelectedItems.map( statusData => statusData.value );
                            let cardStatusMatches = selectedStatusIds.indexOf(card.statusId) !== -1;

                            return isCardNeeded && cardStatusMatches;
                        }

                        if (filterFieldId === 'board') {
                            let selectedBoardIds = filterFieldSelectedItems.map( board => board.id );
                            let isCardInSelectedBoards = selectedBoardIds.indexOf(card.boardId) !== -1;

                            return isCardNeeded && isCardInSelectedBoards;
                        }

                        let isListField = ['hashtag', 'achievement'].indexOf(filterFieldId) !== -1;
                        let fieldMatches = false;

                        if (isListField) {
                            let selectedTags = filterFieldSelectedItems.map(item => item.value );
                            let cardTags = getCardTags(card, filterFieldId).map( tag => tag.text );
                            let selectedTagsInCard = cardTags.filter(tag => selectedTags.includes(tag));
                            fieldMatches = selectedTagsInCard.length > 0;
                        }

                        let cardHasPinnedFields = card.pinnedFieldValues && card.pinnedFieldValues.length > 0;
                        let cardPinnedField = cardHasPinnedFields
                            ? card.pinnedFieldValues.find( valueData => valueData.fieldName === filterFieldId )
                            : false;

                        if (cardPinnedField) {
                            let selectedValues = filterFieldSelectedItems.map(item => item.value );
                            fieldMatches = selectedValues.indexOf(cardPinnedField.value) !== -1;
                        }

                        return isCardNeeded && fieldMatches;
                    }, true);

                    if (this.searchText) {
                        let cardText = this.cardText(card).toLocaleLowerCase();
                        let findWords = this.searchText.toLocaleLowerCase().split(' ');
                        textMatches = findWords.reduce( (anyMatches, word) => {
                            return anyMatches || (word !== '' && cardText.indexOf( word ) !== -1);
                        }, false);
                    }

                    return anyFieldMatches && textMatches;
                });
            },
            filteredCardsGroupedByStatus() {
                this.board; //Чтобы при изменениях отображения перерисовывать карты
                return this.groupByStatus(this.filteredCards);
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

    .v-sheet.filter {
        background: transparent!important;
    }

    .filter .v-list-item__icon {
        margin: 8px 0;
    }

    .filter .v-list-group--sub-group .v-list-group__header {
        padding-left: 16px!important;
    }

    .filter .v-list-group--sub-group .v-list-group__items .v-list-item {
        padding: 0px!important;
    }

    .filter .v-item-group {
        padding-left: 56px!important;
        padding-right: 16px!important;
    }

    .filter .v-list-item--active {
        color: #261440!important;
    }
    .filter .v-list-item__action {
        margin: 0!important;
    }

    .filter .v-list-item {
        min-height: 32px!important;
    }

    .filter .v-list-item__content {
        padding: 0!important;
    }

    .filter .v-list-item__title {
        white-space: normal!important;
    }

    .filter .v-input--selection-controls__input .primary--text {
        color: #261440!important;
    }

    .v-input.white, .v-input.white .v-input__control {
        background: transparent!important;
    }

    .v-input.white .v-input__slot {
        background: white!important;
    }
</style>