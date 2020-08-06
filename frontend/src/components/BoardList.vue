<template>
    <v-main class="fill-height">
        <v-row class="mx-2 mx-md-4">
            <v-col cols="12" md="4">
                <h5>Фильтры</h5>
                <div class="mb-2">
                    <v-list expand class="filter">
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

    export default {
        name: "BoardList",
        components: { BoardCard },
        data() {
            return {
                searchText: '',
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
            }
        },
        computed: {
            filteredBoards() {
                if (!this.searchText) {
                    return this.boards;
                }

                return this.boards.filter( board => {
                    let boardText = this.boardToText(board).toLocaleLowerCase();
                    return boardText.indexOf(this.searchText.toLocaleLowerCase()) !== -1;
                });

            },
            boards() {
                return this.$store.state.boards;
            }
        }
    }
</script>

<style scoped>

</style>