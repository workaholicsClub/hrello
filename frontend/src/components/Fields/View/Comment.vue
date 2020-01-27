<template>
    <v-sheet elevation="2" v-html="comment.text"  class="px-4 py-4">
    </v-sheet>
</template>
<script>
    export default {
        name: "ViewComment",
        props: ['comment'],
    }
</script>