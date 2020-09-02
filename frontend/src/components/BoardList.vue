<template>
    <v-main class="fill-height">
        <v-row class="mx-2 mx-md-4">
            <v-col cols="12" md="4">
                <h5>Фильтры</h5>
                <div class="mb-2">
                    <v-list expand class="filter">
                        <analytics-widget v-if="boardCities.length > 0"
                                :input-stats="boardCities"
                                :record="{id: 'city', name: 'Город'}"
                                key="widget-city"
                                :is-expanded="expandState.city"
                                v-model="filterValues.city"
                                @expand="updateFilterExpandState"
                        ></analytics-widget>

                        <v-text-field
                                ref="searchField"
                                outlined
                                clearable
                                append-icon="mdi-magnify"
                                placeholder="Полный поиск по вакансиям"
                                hint="Нажмите / для выбора"
                                persistent-hint
                                v-model="searchText"
                                class="mt-4 white"
                        ></v-text-field>

                    </v-list>
                </div>
            </v-col>
            <v-col class="cards-row" cols="12" md="8">
                <div class="d-flex mb-2">
                    <span class="flex-fill">Показано вакансий: {{filteredBoards.length}}/{{boards.length}}</span>
                    <v-btn text @click="addBoard"><v-icon>mdi-plus</v-icon> Добавить вакансию</v-btn>
                </div>
                <board-card v-for="board in filteredBoards" :board="board" :key="board.id" @selectBoard="gotoBoard(board)"></board-card>
            </v-col>
        </v-row>
    </v-main>
</template>

<script>
    import BoardCard from "@/components/BoardCard";
    import AnalyticsWidget from "@/components/AnalyticsWidget";

    export default {
        name: "BoardList",
        components: { BoardCard, AnalyticsWidget },
        data() {
            return {
                searchText: '',
                filterValues: {},
                expandState: {},
            }
        },
        mounted() {
            document.onkeydown = e => {
                e = e || window.event;
                if (
                    e.keyCode === 191 && // Forward Slash '/'
                    e.target !== this.$refs.searchField.$refs.input
                ) {
                    e.preventDefault();
                    this.$refs.searchField.focus();
                }
            }
        },
        beforeDestroy () {
            document.onkeydown = null;
        },

        methods: {
            addBoard() {
                this.$root.$emit('newBoard');
            },
            gotoBoard(board) {
                this.$router.push({name: 'board', params: {boardId: board.id}});
            },
            boardToText(board) {
                return JSON.stringify(board);
            },
            updateFilterValues(newFilterValues, record) {
                this.$set(this.filterValues, record.id, newFilterValues);
            },
            updateFilterExpandState(newState, record) {
                this.$set(this.expandState, record.id, newState);
            },
        },
        computed: {
            filteredBoards() {
                let isFilterParamsEmpty = Object.keys(this.filterValues).length !== 0
                    ? (Object
                        .keys(this.filterValues)
                        .reduce((valuesCount, key) => valuesCount + this.filterValues[key].length, 0) === 0)
                    : true;
                let isFilterEmpty = !this.searchText && isFilterParamsEmpty;

                if ( isFilterEmpty ) {
                    return this.boards;
                }

                return this.boards.filter( board => {
                    let boardMatches = true;

                    if (this.searchText) {
                        let boardText = this.boardToText(board).toLocaleLowerCase();
                        let textMatches = boardText.indexOf(this.searchText.toLocaleLowerCase()) !== -1;
                        boardMatches = boardMatches && textMatches;
                    }

                    if (this.filterValues.city) {
                        let selectedCities = this.filterValues.city.map(cityItem => cityItem.value);
                        let cityMatches = selectedCities.indexOf(board.city) !== -1;

                        boardMatches = boardMatches && cityMatches;
                    }

                    return boardMatches;
                });

            },
            boards() {
                return this.$store.state.boards;
            },
            boardCities() {
                let cities = [];

                for (const board of this.boards) {
                    let city = board.city;

                    if (city) {
                        let stats = cities.find( cityStat => cityStat.value === city );
                        if (stats) {
                            stats.count++;
                        }
                        else {
                            cities.push({
                                id: city,
                                title: city,
                                value: city,
                                count: 1
                            });
                        }
                    }
                }

                return cities;
            }
        }
    }
</script>

<style scoped>

</style>