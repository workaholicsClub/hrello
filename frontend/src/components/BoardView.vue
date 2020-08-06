<template>
    <div class="board-view fill-height">
        <kanban-board v-if="kanban"></kanban-board>
        <analytics-board v-else></analytics-board>
    </div>
</template>

<script>
    import AnalyticsBoard from "@/components/AnalyticsBoard";
    import KanbanBoard from "@/components/KanbanBoard";

    export default {
        name: "BoardView",
        components: {AnalyticsBoard, KanbanBoard},
        computed: {
            boardId() {
                return this.$route.params.boardId;
            },
            board() {
                return this.$store.getters.boardById(this.boardId);
            },
            kanban() {
                return this.board.type === 'kanban';
            }
        }
    }
</script>

<style scoped>
    .board-view {
        width: 100%;
    }
</style>