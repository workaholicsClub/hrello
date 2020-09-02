<template>
    <div class="board-view fill-height">
        <kanban-board v-if="kanban"></kanban-board>
        <cli-board v-else-if="cli"></cli-board>
        <list-board v-else></list-board>
    </div>
</template>

<script>
    import ListBoard from "@/components/ListBoard";
    import KanbanBoard from "@/components/KanbanBoard";
    import CliBoard from "@/components/CliBoard";

    export default {
        name: "BoardView",
        components: {ListBoard, KanbanBoard, CliBoard},
        computed: {
            boardId() {
                return this.$route.params.boardId;
            },
            board() {
                return this.$store.getters.boardById(this.boardId);
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
    }
</style>