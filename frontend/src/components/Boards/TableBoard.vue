<template>
    <v-main class="fill-height">
        <v-row class="mx-2 mx-md-4">
            <v-col cols="12" md="6">
                <v-text-field
                        ref="searchField"
                        outlined
                        clearable
                        append-icon="mdi-magnify"
                        placeholder="Поиск по таблице"
                        hint="Нажмите / для выбора"
                        persistent-hint
                        v-model="search"
                        class="mb-4 white"
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="d-flex justify-end">
                <v-menu bottom offset-y v-if="hasBoard">
                    <template v-slot:activator="{ on }">
                        <v-btn text :loading="isResumeUploading" v-on="on"><v-icon>mdi-plus</v-icon> Добавить кандидата</v-btn>
                    </template>
                    <v-list>
                        <v-list-item @click="selectFile">
                            <v-list-item-title>Загрузить резюме</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="sendAddNewCardEvent">
                            <v-list-item-title>Добавить пустую карточку</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
        </v-row>
        <v-row class="mx-2 mx-md-4">
            <v-col cols="12">
                <v-data-table
                        :headers="headers"
                        :items="cardsForTable"
                        :search="search"
                        locale="ru"
                        fixed-header
                        show-group-by
                        :show-select="false"
                        @click:row="showCard"
                >
                    <template v-slot:item.actions="{ item }">
                        <v-menu bottom left offset-x @click.native.stop.prevent>
                            <template v-slot:activator="{ on }">
                                <v-btn icon text v-on="on" @click.stop><v-icon>mdi-dots-horizontal</v-icon></v-btn>
                            </template>
                            <card-menu :card="item.card"></card-menu>
                        </v-menu>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <input type="file" style="display: none" ref="fileInput" @change="addNewResume">
    </v-main>
</template>

<script>
    import BoardsCommon from "@/mixins/BoardsCommon";
    import CardMenu from "@/components/Menus/CardMenu";

    export default {
        name: "TableBoard",
        components: {CardMenu},
        mixins: [BoardsCommon],
        data() {
            return {
                search: null,
                isResumeUploading: false,
            }
        },
        mounted() {
            this.enableKeyFocus();
        },
        beforeDestroy () {
            this.disableKeyFocus();
        },
        methods: {
            sendAddNewCardEvent() {
                let newCardStatus = this.statuses[0];
                this.$root.$emit('addCard', newCardStatus);
            },
            showCard(item) {
                this.$root.$emit('selectCard', item.card.id);
            }
        },
        computed: {
            pinnedFields() {
                return this.$store.getters.activePinnedFields(this.board);
            },
            headers() {
                this.board;

                let headers = [
                    { text: 'Имя', groupable: false, sortable: true, filterable: true, value: 'Имя'},
                    { text: 'Этап', groupable: true, sortable: true, filterable: true, value: 'Этап' },
                ];

                for (let field of this.pinnedFields) {
                    if (!field.isTableHidden) {
                        headers.push({text: field.name, groupable: true, value: field.name});
                    }
                }

                headers.push({ text: 'Действия', value: 'actions', sortable: false, groupable: false, filterable: false });

                return headers;
            },
            cardsForTable() {
                this.board;

                let statusesHash = this.statuses.reduce( (hash, status) => {
                    hash[status.id] = status.title;
                    return hash;
                }, {});

                return this.cards ? this.cards.map( card => {
                    let valuesHash = card.pinnedFieldValues ? card.pinnedFieldValues.reduce( (hash, {fieldId, value}) => {
                        hash[fieldId] = value;
                        return hash;
                    }, {}) : {};

                    let cardItem = {
                        'Этап': statusesHash[card.statusId] || '',
                        'Имя': card.name,
                    }

                    for (let field of this.pinnedFields) {
                        cardItem[field.name] = valuesHash[field.id] || '';
                    }

                    cardItem.card = card;
                    return cardItem;
                }) : [];
            }
        }
    }
</script>

<style>
    .v-input.white, .v-input.white .v-input__control {
        background: transparent!important;
    }

    .v-input.white .v-input__slot {
        background: white!important;
    }

    th .v-icon + span {
        color: transparent;
        font-size: 0;
        display: none;
    }

    th:hover .v-icon + span,
    th:active .v-icon + span {
        display: inline-block;
    }

    th:hover .v-icon + span:before,
    th:active .v-icon + span:before {
        content: '\FAB4';
        color: rgba(0, 0, 0, 0.38);
        display: inline;
        font-size: 18px;
        font-family: "Material Design Icons";
    }
</style>