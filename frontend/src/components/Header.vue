<template>
    <v-app-bar app fixed flat>
        <span v-if="!isDesktop">
            <v-app-bar-nav-icon @click.stop="$emit('drawer')" />
        </span>
        <v-toolbar-title>Без названия</v-toolbar-title>
    </v-app-bar>
</template>
<script>
    export default {
        name: 'Header',
        props: ['isDesktop']
    }
</script>
<style>
</style>