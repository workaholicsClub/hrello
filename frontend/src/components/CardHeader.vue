<template>
    <v-app-bar app fixed flat class="top-header">
        <v-toolbar-title class="pl-3">
            {{ currentCardTitle || 'Без названия' }}
            <small class="text--disabled text-caption d-block">Сохранено {{savedTime}} назад</small>
        </v-toolbar-title>
        <v-spacer/>

        <v-btn v-if="$route.name === 'card'" icon text @click="sendShareCardEvent"><v-icon>mdi-share-variant</v-icon></v-btn>
        <slot name="menu">
            <v-menu bottom left offset-x @click.native.stop.prevent class="menu-top">
                <template v-slot:activator="{ on }">
                    <v-btn icon text v-on="on" @click.stop><v-icon>mdi-dots-horizontal</v-icon></v-btn>
                </template>
                <card-menu :card="currentCard"></card-menu>
            </v-menu>
        </slot>
    </v-app-bar>
</template>

<script>
    import CardMenu from "./Menus/CardMenu";
    import moment from "moment";

    export default {
        name: "CardHeader",
        components: {
            CardMenu,
        },
        methods: {
            sendShareCardEvent() {
                this.$root.$emit('shareCard', this.currentCard);
            },
        },
        computed: {
            sidebarWidth() {
                return 300;
            },
            width() {
                switch (this.$vuetify.breakpoint.name) {
                    case 'md':
                    case 'lg':
                    case 'xl':
                        return `calc(100vw - ${this.sidebarWidth}px)`;
                    default:
                        return '100vw';
                }
            },
            currentCardTitle() {
                if (!this.currentCard) {
                    return false;
                }

                let isDefaultName = /Кандидат \d+/.test(this.currentCard.name);
                let newCardTitle = 'Новый кандидат';
                if (isDefaultName) {
                    return newCardTitle;
                }

                return this.currentCard.name || newCardTitle;
            },

            savedTime() {
                let now = moment();
                let savedTime = moment(this.currentCard.lastUpdated);
                return moment.duration( now.diff(savedTime) ).humanize();
            },
            currentCard() {
                return this.$store.state.card.currentCard;
            },


        }
    }
</script>

<style scoped>
    .transparent-bg {
        background: transparent!important;
    }

    .top-header {
        /*border-radius: 24px 0 0 0!important;*/
    }

    @media (max-width: 600px) {
        .top-header {
            padding-left: 32px;
            border-radius: 0!important;
        }
    }

</style>