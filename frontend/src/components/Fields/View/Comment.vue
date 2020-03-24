<template>
    <v-card elevation="0" class="px-4 pt-1 my-1">
        <v-list-item>
            <v-list-item-avatar color="grey">
                <v-img :src="comment.author.imageUrl || false"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-subtitle>{{comment.author.fullName || ''}}</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-card-text v-html="comment.text" class="text--primary"></v-card-text>
    </v-card>
</template>
<script>
    export default {
        name: "ViewComment",
        props: ['comment'],
    }
</script>