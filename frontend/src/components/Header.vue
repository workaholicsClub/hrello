<template>
    <v-app-bar app fixed flat>
        <v-app-bar-nav-icon v-if="!isDesktop && !showBack" @click.stop="$emit('drawer')" />
        <v-btn icon v-if="showBack" @click.stop="$emit('back')"><v-icon>mdi-chevron-left</v-icon></v-btn>
        <v-toolbar-title :class="{'d-flex': isTitleEditing}">
            <v-text-field v-model="newTitle" v-if="isTitleEditing" @input="$emit('input', newTitle)"></v-text-field>
            <span v-else>{{ title || 'Без названия' }}</span>
            <v-btn v-if="allowTitleEdit && !isTitleEditing" icon @click="isTitleEditing = true"><v-icon>mdi-pencil</v-icon></v-btn>
            <v-btn v-if="allowTitleEdit && isTitleEditing" icon @click="isTitleEditing = false"><v-icon>mdi-check</v-icon></v-btn>
        </v-toolbar-title>
        <v-spacer/>
        <slot name="menu"></slot>
    </v-app-bar>
</template>
<script>
    export default {
        name: 'Header',
        props: ['isDesktop', 'title', 'allowTitleEdit'],
        data() {
            return {
                isTitleEditing: false,
                newTitle: this.title,
            }
        },
        watch: {
            title() {
                this.newTitle = this.title;
            }
        },
        computed: {
            showBack() {
                return this.$route.name === 'card' || this.$route.name === 'vacancy';
            }
        }
    }
</script>
<style>
</style>