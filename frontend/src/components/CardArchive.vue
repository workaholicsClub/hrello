<template>
    <v-content class="fill-height" :class="{'align-items-start': !isLoading, 'justify-content-start': !isLoading}">
        <v-container fill-height fluid v-if="isLoading">
            <v-row align="center" justify="center">
                <v-progress-circular
                        :size="70"
                        :width="7"
                        color="#261440"
                        indeterminate
                ></v-progress-circular>
            </v-row>
        </v-container>
        <v-container class="fill-height align-start justify-start board mt-2 p-4" align="start" fluid v-else>
            <v-row>
                <v-col><v-text-field outlined label="Поиск" append-icon="mdi-magnify" v-model="query" hide-details></v-text-field></v-col>
            </v-row>
            <v-row align="start" justify="start" class="fill-height">
                <v-col v-for="card in filteredCards" :key="card.id" cols="12" md="4"><card :card="card" :boards="boards"></card></v-col>
            </v-row>
        </v-container>
    </v-content>
</template>

<script>
    import Card from "./Card";

    export default {
        name: "CardArchive",
        props: ['type', 'boards', 'cards', 'user', 'isLoading'],
        components: {
            Card,
        },
        data() {
            return {
                query: null,
            }
        },
        computed: {
            filteredCards() {
                return this.query
                    ? this.cards.filter(card => {
                            return card.name
                                ? card.name.toLowerCase().indexOf( this.query.toLowerCase() ) !== -1
                                : false;
                        })
                    : this.cards;
            }
        }
    }
</script>

<style scoped>
    .board {
        background-color: #f6fcfe;
    }

</style>

<style>
    .v-content.fill-height .v-content__wrap {
        height: 100%;
    }
</style>