<template>
    <v-main
            class="mt-2"
            :class="{'wide': isHorizontalScrollable }"
            v-resize="updateDesktop"
            app
    >
        <v-row class="align-items-center">
            <v-col cols="12" md="8" class="p-3">
                <v-text-field
                        ref="searchField"
                        outlined
                        clearable
                        append-icon="mdi-magnify"
                        placeholder="Полный поиск по карточкам и резюме"
                        hint="Нажмите / для выбора"
                        persistent-hint
                        v-model="searchText"
                        class="mt-4 white"
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" class="pt-0">
                <v-menu bottom offset-y>
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
            </v-col>
        </v-row>

        <div class="board fill-height"
                :class="{'board-scrollable': isHorizontalScrollable}"
                v-dragscroll="isHorizontalScrollable"
        >
            <div class="row fill-height justify-start"
                    :class="{'scrollable': isHorizontalScrollable}"
            >
                <status v-for="(status, index) in statusesWithFilteredCards"
                        :key="status.id"
                        :status="status"
                        :last="index === statuses.length-1"
                        :vertical="true"
                        :cards="status.cards"
                        class="mr-4"
                        @input="updateStatusTitle"
                ></status>
                <v-col class="new-status" cols="4">
                    <v-btn text @click="addNewStatus"><v-icon>mdi-plus</v-icon> Добавить этап</v-btn>
                </v-col>
            </div>
        </div>
        <input type="file" style="display: none" ref="fileInput" @change="addNewResume">
    </v-main>
</template>
<script>
    import Status from "./Status.vue";
    import { dragscroll } from 'vue-dragscroll';
    import {clone, sortByIndex} from "../unsorted/Helpers";
    import BoardsCommon from "@/mixins/BoardsCommon";

    export default {
        name: 'KanbanBoard',
        directives: {
            dragscroll
        },
        components: {
            Status
        },
        mixins: [BoardsCommon],
        data() {
            return {
                searchText: '',
                isDesktop: this.$isDesktop(),
                isResumeUploading: false,
                dragStartPosition: false,
                dragStartElLeft: false,
            }
        },
        mounted() {
            this.enableKeyFocus();
        },
        beforeDestroy () {
            this.disableKeyFocus();
        },

        methods: {
            addNewStatus() {
                this.$store.dispatch('addBoardStatus', {board: this.board, newStatus: false})
            },
            sendAddNewCardEvent() {
                let newCardStatus = this.statuses[0];
                this.$root.$emit('addCard', newCardStatus);
            },
            updateDesktop() {
                this.isDesktop = this.$isDesktop();
            },
            matchCardText(card) {
                if (!this.searchText) {
                    return true;
                }

                return this.cardText(card).indexOf( this.searchText.toLocaleLowerCase() ) !== -1;
            },
            getStatusCards(searchedStatusId, cards) {
                return cards
                        .filter(card => card.statusId === searchedStatusId)
                        .sort( (a, b) => a.sort - b.sort )
                    || [];
            },
            updateStatusTitle(changedStatus, newTitle) {
                changedStatus.title = newTitle;
                this.$root.$emit('updateStatus', changedStatus);
            }
        },
        computed: {
            isHorizontalScrollable() {
                return this.isDesktop;
            },
            sortedStatuses() {
                return sortByIndex(this.statuses);
            },
            statusesWithFilteredCards() {
                let filteredCards = this.cards.filter(this.matchCardText);
                let statusesWithCards = clone(this.statuses).map( status => {
                    status.cards = this.getStatusCards(status.id, filteredCards);
                    return status;
                });

                return statusesWithCards;
            },
        }
    }
</script>
<style scoped>
    .board {
        display: inline-block;
        width: 100%;
        overflow: hidden;
        min-height: 300px;
        cursor: grab;
        user-select: none;
        padding: 20px;
    }

    .board-scrollable {
        max-height: calc(100vh - 205px);
        padding: 0 0 0 14px;
    }

    .board:active {
        cursor: grabbing;
    }

    .wide .row.scrollable {
        min-width: 10000px;
    }

    .new-status {
        display: inline-block;
        vertical-align: top;
        font-size: 0.9em;
        cursor: default;
        user-select: auto;

        padding: 0 32px 0 0;
        /*min-width: 100vw!important;*/
    }

    .new-status .v-btn {
        /*color: #b5d2db;*/
        padding: 0 6px;
        font-size: 12px;
        height: 24px;
    }
</style>

<style>
    .v-main.wide .v-main__wrap {
        padding-left: 24px;
    }
</style>