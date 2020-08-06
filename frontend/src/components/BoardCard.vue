<template>
    <v-card outlined elevation="2" min-width="300" @click="sendSelectCardEvent" :ripple="false">
        <v-card-text class="d-flex">
            <v-list-item class="vacancy-data">
                <v-list-item-content>
                    <v-list-item-title class="text-h6 headline">{{board.title || 'Новая вакансия'}}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <div class="d-flex flex-column align-items-end">
                <span class="dates mb-2" v-if="openedTime">{{ openedTime }} назад</span>
                <div class="d-flex">
                    <v-list-item class="info-chip">
                        <h6>{{countTotalCards()}}</h6>
                        <small>кандидатов</small>
                    </v-list-item>
                    <v-list-item class="info-chip" v-for="status in board.statuses" :key="status.id">
                        <h6>{{countCards(status)}}</h6>
                        <small>{{status.title.toLocaleLowerCase()}}</small>
                    </v-list-item>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
    import moment from "moment";

    export default {
        name: "BoardCard",
        props: ['board'],
        methods: {
            countTotalCards() {
                return this.boardCards.length;
            },
            countCards(status) {
                let statusCards = this.boardCards.filter( card => card.statusId === status.id );
                return statusCards.length;
            },
            sendSelectCardEvent() {
                this.$emit('selectBoard', this.board.id);
            },
        },
        computed: {
            boardCards() {
                return this.$store.getters.cardsForBoardId(this.board.id);
            },
            openedTime() {
                if (!this.board.dateCreated) {
                    return false;
                }

                let dateCreated = moment(this.board.dateCreated);

                return dateCreated.toNow(true);
            }
        }
    }
</script>

<style scoped>
    .v-card {
        margin-bottom: 8px;
        cursor: pointer;
        min-width: 375px;
    }

    .v-card,
    .v-card .v-list-item,
    .v-card .theme--light.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled) {
        color: #261440!important;
    }

    .v-card .v-list-item .v-list-item__content {
        align-self: start;
    }

    .v-card .elevation-2 {
        box-shadow: 0 3px 7px -2px rgba(0, 0, 0, 0.2) !important;
    }

    .v-card p, .v-card h1, .v-card h2, .v-card h3, .v-card h4, .v-card h5, .v-card h6 {
        margin-bottom: 0;
    }

    .v-card h6 {
        font-size: 16px;
        margin-bottom: 2px;
    }

    .v-card .info-chip {
        display: flex;
        flex-direction: column;
        align-items: self-end;
        background: #e9f2f4;
        border-radius: 4px;
        margin-right: 8px;
        padding: 8px;
    }

    .v-card .dates {
        margin-right: 8px;
    }

    .v-card .v-list-item::after {
        content: none;
    }

    .v-card .info-chip h6 {
        font-size: 34px;
        line-height: 30px;
        margin: 0;
    }

    .v-card .vacancy-data {
        flex: 1 0 35%;
    }

    .v-card .info-chip small {
        font-size: 14px;
    }
</style>