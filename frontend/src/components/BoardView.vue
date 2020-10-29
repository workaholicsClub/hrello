<template>
    <div class="board-view fill-height">
        <kanban-board v-if="kanban"></kanban-board>
        <cli-board v-else-if="cli"></cli-board>
        <table-board v-else-if="table"></table-board>
        <list-board v-else></list-board>
    </div>
</template>

<script>
    import ListBoard from "@/components/Boards/ListBoard";
    import KanbanBoard from "@/components/Boards/KanbanBoard";
    import CliBoard from "@/components/Boards/CliBoard";
    import TableBoard from "@/components/Boards/TableBoard";

    export default {
        name: "BoardView",
        components: {ListBoard, KanbanBoard, CliBoard, TableBoard},
        computed: {
            boardId() {
                return this.$route.params.boardId;
            },
            board() {
                return this.$store.getters.boardById(this.boardId);
            },
            table() {
                return this.board && this.board.type === 'table';
            },
            kanban() {
                return this.board && this.board.type === 'kanban';
            },
            cli() {
                return this.board && this.board.type === 'cli';
            }
        }
    }
</script>

<style scoped>
    .board-view {
        width: 100%;
        background: #e7f2f5!important;
    }
</style>