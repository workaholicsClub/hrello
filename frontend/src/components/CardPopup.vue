<template>
    <v-overlay absolute z-index="105" :value="visible" class="justify-end align-start popup-overlay" @click.self="$emit('back')">
        <v-btn fab absolute small light elevation="0" class="close-popup-button" @click="$emit('back')">
            <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-sheet light class="card-popup">
            <card-header></card-header>
            <smart-card :in-popup="true"></smart-card>
        </v-sheet>
    </v-overlay>
</template>

<script>
    import SmartCard from "@/components/SmartCard";
    import CardHeader from "@/components/CardHeader";

    export default {
        name: "CardPopup",
        components: {SmartCard, CardHeader},
        props: ['visible'],
        data() {
            return {
            }
        },
        computed: {
        }
    }
</script>

<style scoped>
    .popup-overlay {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }
    .card-popup {
        background: transparent!important;
        right: 0;
        top: 0;
        /*border-radius: 24px 0 0 0!important;*/
    }

    .close-popup-button {
        top: 8px;
        left: 252px;
        /*margin-left: -48px;*/
        z-index: 1000;
    }

    @media (max-width: 600px) {
        .card-popup {
            border-radius: 0!important;
        }

        .close-popup-button {
            left: 8px;
            margin-left: 0;
        }
    }
</style>

<style>
    .v-overlay__content {
        width: 100%;
    }

    @media (max-width: 600px) {
        .v-overlay__content {
            /*height: 100%;*/
        }
    }
</style>