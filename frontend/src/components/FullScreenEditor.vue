<template>
    <v-content class="fs-details fill-height">
        <v-container class="align-start justify-start" fill-height>
            <edit-comment
                    v-model="commentMock"
                    @input="updateText"
            ></edit-comment>
        </v-container>
    </v-content>
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