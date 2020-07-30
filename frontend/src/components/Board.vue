<template>
    <v-main class="fill-height">
        <v-container class="fill-height board mt-2" :class="{'wide': isHorizontalScrollable }" v-dragscroll:nochilddrag="{'active': isHorizontalScrollable}" fluid >
            <div
                    class="row scrollable justify-start row--dense"
                    data-dragscroll
            >
                <status v-for="(status, index) in sortedStatuses"
                        :key="status.id"
                        :status="status"
                        :last="index === statuses.length-1"
                        :cards="getStatusCards(status.id)"
                        @input="updateStatusTitle"
                ></status>
                <v-col class="new-status" cols="4">
                    <v-btn text ><v-icon>mdi-plus</v-icon> Добавить статус</v-btn>
                </v-col>
            </div>
        </v-container>
    </v-main>
</template>
<script>
    import Status from "./Status.vue"
    import { dragscroll } from 'vue-dragscroll'
    import { sortByIndex } from "../unsorted/Helpers";

    export default {
        name: 'Board',
        props: ['isDesktop', 'statuses', 'cards'],
        directives: {
            dragscroll
        },
        components: {
            Status
        },
        data() {
            return {
                dragStartPosition: false,
                dragStartElLeft: false,
            }
        },
        methods: {
            dragStart(event) {
                let scrollableAreaEl = document.querySelector('.scrollable');
                this.dragStartPosition = event.pageX - scrollableAreaEl.offsetLeft;
                this.dragStartElLeft = scrollableAreaEl.offsetLeft;
            },
            dragEnd() {
                this.dragStartPosition = false;
                this.dragStartElLeft = false;
            },
            dragScroll(event) {
                let isButtonPressed = event.buttons > 0;
                if (!isButtonPressed) {
                    return;
                }

                event.preventDefault();
                let scrollableAreaEl = document.querySelector('.scrollable');
                let x = event.pageX - scrollableAreaEl.offsetLeft;
                let speed = 3;
                let shiftX = (x - this.dragStartPosition ) * speed;
                scrollableAreaEl.scrollLeft = this.dragStartElLeft - shiftX;
            },
            getStatusCards(searchedStatusId) {
                return this.cards
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
            }
        }
    }
</script>
<style scoped>
    .v-main__wrap {

    }

    .board {
        background-color: #f6fcfe;

        display: inline-block;
        padding: 20px;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        min-height: 300px;
        cursor: grab;
        user-select: none;
    }

    .board:active {
        cursor: grabbing;
    }

    .wide.board {
        padding: 24px;
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
        min-width: 100vw!important;
    }

    .new-status .v-btn {
        color: #b5d2db;
        padding: 0 6px;
        font-size: 12px;
        height: 24px;
    }
</style>