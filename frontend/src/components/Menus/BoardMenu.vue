<template>
    <v-list>
        <v-list-item @click="sendShareEvent">
            <v-list-item-icon>
                <v-icon>mdi-share-variant</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Поделиться</v-list-item-title>
        </v-list-item>
    </v-list>
</template>

<script>
    export default {
        name: "BoardMenu",
        props: ['board'],
        methods: {
            sendShareEvent() {
                this.$root.$emit('shareBoard', this.board);
            },
        }
    }
</script>

<style scoped>

</style>