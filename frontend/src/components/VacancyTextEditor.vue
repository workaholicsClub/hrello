<template>
    <full-screen-editor :text="currentBoard.vacancyText" @input="updateVacancyText"></full-screen-editor>
</template>

<script>
    import FullScreenEditor from "./FullScreenEditor";

    export default {
        name: "VacancyTextEditor",
        components: {
            FullScreenEditor
        },
        methods: {
            updateVacancyText(vacancyText) {
                this.$store.commit('updateBoard', {boardId: this.boardId, field: 'vacancyText', value: vacancyText});
            }
        },
        computed: {
            boardId() {
                return this.$route.params.boardId;
            },
            currentBoard() {
                return this.$store.getters.boardById(this.boardId);
            }
        }
    }
</script>

<style scoped>

</style>