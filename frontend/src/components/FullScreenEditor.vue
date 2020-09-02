<template>
    <v-container class="fs-details fill-height p-0">
        <v-container class="align-start justify-start p-0" fill-height>
            <edit-comment
                    v-model="commentMock"
                    @input="updateText"
            ></edit-comment>
        </v-container>
    </v-container>
</template>

<script>
    import EditComment from "./Fields/Edit/Comment";

    export default {
        name: "FullScreenEditor",
        props: ['text'],
        components: {
            EditComment
        },
        data() {
            return {
                commentMock: {text: this.text}
            }
        },
        methods: {
            updateText() {
                this.$emit('input', this.commentMock.text);
            }
        }
    }
</script>

<style scoped>
    .fs-details {
        background: #fff;
    }
</style>

<style>
    .fs-details .new-comment {
        width: 100%;
        height: 100%;
    }
</style>