<template>
    <v-list-group
            sub-group
            no-action
            :value="expanded"
            @input="sendExpandState"
    >
        <template v-slot:prependIcon>
            <v-icon v-text="expanded ? 'mdi-close-circle' : 'mdi-plus-circle-outline'"></v-icon>
        </template>
        <template v-slot:appendIcon>
            <v-chip color="" label>{{stats.length}}</v-chip>
        </template>
        <template v-slot:activator>
            <v-list-item-content>
                <v-list-item-title>
                    {{record.name}}
                    <span v-if="selectedValues.length > 0">
                        ({{selectedValues.length}})
                    </span>
                </v-list-item-title>
            </v-list-item-content>
        </template>

        <v-list-item-group v-if="showAsSelect">
            <v-autocomplete
                v-model="selectedValues"
                :items="stats"
                multiple
                outlined
                hide-details
                chips
                deletable-chips
                clearable
                item-text="title"
                item-value="value"
                label="Укажите значение"
                class="solo-outlined"
                @input="sendValuesUpdate"
            >
                <template v-slot:no-data>
                    Список пуст
                </template>
            </v-autocomplete>
        </v-list-item-group>
        <v-list-item-group v-else
                v-model="selectedValues"
                multiple
                sub-group
                :no-action="false"
                @change="sendValuesUpdate"
        >
            <template v-for="(statRecord, i) in stats">
                <v-list-item
                        :key="`item-${i}`"
                        :value="statRecord.value"
                        class="pl-6"
                >
                    <template v-slot:default="{ active, toggle }">
                        <v-list-item-content>
                            <v-list-item-title>{{statRecord.title}} ({{statRecord.count}})</v-list-item-title>
                        </v-list-item-content>

                        <v-list-item-action>
                            <v-checkbox
                                    :input-value="active"
                                    :true-value="statRecord.value"
                                    @click="toggle"
                            ></v-checkbox>
                        </v-list-item-action>
                    </template>
                </v-list-item>
            </template>
        </v-list-item-group>

    </v-list-group>
</template>

<script>
    import {getDefaultColors, getFilteredRecords} from "../unsorted/Helpers";
    import moment from "moment";

    export default {
        name: "AnalyticsWidget",
        props: ['cards', 'record', 'inputStats', 'value', 'isExpanded', 'showAsSelect'],
        data() {
            let valuesOfArray = this.value instanceof Array
                ? this.value.map( valueData => valueData.value )
                : [];
            return {
                selectedValues: valuesOfArray,
                expanded: typeof(this.isExpanded) === 'boolean' ? this.isExpanded : false
            }
        },
        watch: {
            value: {
                deep: true,
                handler() {
                    this.selectedValues = this.value instanceof Array
                        ? this.value.map(valueData => valueData.value)
                        : [];
                }
            },
            isExpanded() {
                this.expanded = this.isExpanded;
            }
        },
        methods: {
            getFilteredRecords(cards, searchRecord) {
                return getFilteredRecords(cards, searchRecord);
            },
            getGenericStats(cards, searchRecord) {
                const noValueTitle = 'Без значения';

                let filteredRecords = this.getFilteredRecords(cards, searchRecord);
                let valuesHash = filteredRecords.reduce( (valuesHash, record) => {
                    let hasValue = Boolean(record.value) && record.value !== 0;
                    let value = hasValue ? record.value : noValueTitle;

                    let valueIsArray = value instanceof Array;
                    let valueIsStringArray = typeof(value) === 'string' && value.indexOf(',') !== -1;
                    let allValues = valueIsStringArray
                        ? value.split(',')
                        : (valueIsArray ? value : [value]);

                    allValues.forEach( currentValue => {
                        if (typeof (valuesHash[currentValue]) === 'undefined') {
                            valuesHash[currentValue] = 0;
                        }

                        valuesHash[currentValue]++;
                    });

                    return valuesHash;
                }, {});

                let valueObjects = Object.keys(valuesHash).map( key => {
                    let value = key !== noValueTitle ? key : null;
                    return {title: key, value: value, count: valuesHash[key]};
                });

                return valueObjects;
            },
            getFirstFilteredRecord(cards, searchRecord) {
                let filteredRecords = this.getFilteredRecords(cards, searchRecord);
                return filteredRecords[0];
            },
            getColorStats(cards, searchRecord) {
                let stats = this.getGenericStats(cards, searchRecord);
                let firstFilteredRecord = this.getFirstFilteredRecord(cards, searchRecord);
                let recordColors = firstFilteredRecord.colors;
                let defaultColors = getDefaultColors();

                let colorStats = stats.map( statItem => {
                    let color = recordColors.find( colorItem => colorItem.value === statItem.value );
                    let defaultColor = defaultColors.find( colorItem => colorItem.value === statItem.value );

                    if (color) {
                        statItem.title = color.text || defaultColor.defaultName;
                        statItem.color = color.color;
                    }
                    else if (defaultColor) {
                        statItem.title = defaultColor.defaultName;
                        statItem.color = defaultColor.color;
                    }

                    return statItem;
                });

                return colorStats;
            },
            getTimeRangeStats(cards, searchRecord) {
                let stats = this.getGenericStats(cards, searchRecord);
                let now = moment();
                let endOfDay = now.clone().endOf('day');
                let endOfWeek = now.clone().endOf('week');
                let endOfMonth = now.clone().endOf('month');

                let statItemsDefaults = {
                    today: {title: 'Сегодня', id: 'today', count: 0, value: endOfDay.toISOString()},
                    thisWeek: {title: 'На этой неделе', id: 'thisWeek', count: 0, value: endOfWeek.toISOString()},
                    thisMonth: {title: 'В этом месяце', id: 'thisMonth', count: 0, value: endOfMonth.toISOString()},
                    past: {title: 'Прошло', id: 'past', count: 0, value: now.toISOString()},
                };

                let timeStats = stats.reduce( (collectedStats, statRecord) => {
                    let recordTime = moment(statRecord.value);
                    if ( recordTime.isBefore(now) ) {
                        collectedStats.past.count++;
                    }
                    else {
                        if (recordTime.isBefore(endOfDay)) {
                            collectedStats.today.count++;
                        }

                        if (recordTime.isBefore(endOfWeek)) {
                            collectedStats.thisWeek.count++;
                        }

                        if (recordTime.isBefore(endOfMonth)) {
                            collectedStats.thisMonth.count++;
                        }
                    }

                    return collectedStats;
                }, statItemsDefaults);

                return Object.values(timeStats);
            },
            sendValuesUpdate() {
                let selectedStats = this.stats.filter( stat => this.selectedValues.indexOf( stat.value ) !== -1 );
                this.$emit('input', selectedStats, this.record);
            },
            clearValues() {
                this.selectedValues = [];
                this.sendValuesUpdate();
            },
            sendExpandState() {
                this.expanded = !this.expanded;
                if (!this.expanded) {
                    this.clearValues();
                }

                this.$emit('expand', this.expanded, this.record);
            },
            sendStatsEvent(stats) {
                this.$emit('stats', stats, this.record);
            }
        },
        computed: {
            stats() {
                let stats = null;

                if (this.inputStats) {
                    this.sendStatsEvent(this.inputStats, this.record);
                    return this.inputStats;
                }

                if (this.record.fieldType === 'color') {
                    stats = this.getColorStats(this.cards, this.record);
                    this.sendStatsEvent(stats);
                    return stats;
                }

                if (this.record.type === 'event') {
                    stats = this.getTimeRangeStats(this.cards, this.record);
                    this.sendStatsEvent(stats);
                    return stats;
                }

                stats = this.getGenericStats(this.cards, this.record);
                this.sendStatsEvent(stats);
                return stats;
            }
        }
    }
</script>

<style>
    .v-input.solo-outlined {
        background: white;
    }
    .solo-outlined .v-select__selections {
        min-height: 42px!important;
    }
</style>