<template>
    <v-container
            fluid
            class="card-details fill-height p-0"
            :class="{'is-desktop': !$vuetify.breakpoint.mobile, 'is-mobile': $vuetify.breakpoint.mobile}"
    >
        <v-main app fluid class="content">
            <v-container fluid class="g">
                <v-container class="vacancy-fields overflow">
                    <v-text-field
                            v-model="vacancy.title"
                            hide-details
                            dense
                            placeholder="Укажите название вакансии"
                            class="mb-4 text-h4"
                            @input="updateFields"
                    ></v-text-field>
                    <h4 class="mt-12">Заказчик</h4>
                    <v-text-field
                            v-model="vacancy.orderedBy"
                            hide-details
                            dense
                            placeholder="Укажите чья это вакансия"
                            class="mb-4 text-h6"
                            @input="updateFields"
                    ></v-text-field>
                    <h4 class="mt-12">Город</h4>
                    <v-text-field
                            v-model="vacancy.city"
                            hide-details
                            dense
                            placeholder="Укажите город"
                            class="mb-4 text-h6"
                            @input="updateFields"
                    ></v-text-field>
                    <h4 class="mt-12">Текст вакансии</h4>
                    <full-screen-editor :text="vacancy.vacancyText" @input="updateVacancyText"></full-screen-editor>

                    <h4 class="mt-12">Ключевые навыки</h4>
                    <v-combobox
                            v-model="vacancy.skills"
                            :items="skills"
                            deletable-chips
                            chips
                            placeholder="Заполните навыки"
                            persistent-hint
                            hint="Enter для разделения навыков. Используются для поиска и распознования в резюме"
                            multiple
                            @input="updateFields"
                    ></v-combobox>

                    <h4 class="mt-12">Вид списка кандидатов</h4>
                    <v-select
                            v-model="vacancy.type"
                            :items="boardTypes"
                    ></v-select>

                    <v-btn block lg rounded elevation="0" color="success" class="mt-12" v-if="isNew" @click="addVacancy">
                        Добавить
                    </v-btn>
                    <v-btn block lg rounded elevation="0" color="success" class="mt-12" v-else-if="changed" @click="saveVacancy">
                        Сохранить
                    </v-btn>
                </v-container>
            </v-container>
        </v-main>
    </v-container>
</template>

<script>
    import FullScreenEditor from "./FullScreenEditor";

    export default {
        name: "VacancyEditor",
        components: {
            FullScreenEditor
        },
        data() {
            return {
                vacancy: {title: '', vacancyText: ''},
                changed: false,
            }
        },
        mounted() {
            if (!this.isNew) {
                this.vacancy = this.currentBoard;
            }
        },
        methods: {
            updateVacancyText(vacancyText) {
                //this.$store.commit('updateBoard', {boardId: this.boardId, field: 'vacancyText', value: vacancyText});
                this.vacancy.vacancyText = vacancyText;
                this.updateFields();
            },
            updateFields() {
                this.$emit('input', this.vacancy);
                this.changed = true;
            },
            addVacancy() {
                this.$root.$emit('newBoard', this.vacancy);
                this.vacancy = {};
            },
            saveVacancy() {
                this.$store.commit('updateFullBoard', this.vacancy);
                this.changed = false;
            }
        },
        computed: {
            skills() {
                return this.currentBoard
                    ? this.currentBoard.skills || []
                    : this.$store.getters.allSkills;
            },
            boardId() {
                return this.$route.params.boardId;
            },
            isNew() {
                return !this.boardId;
            },
            currentBoard() {
                return this.$store.getters.boardById(this.boardId);
            },
            boardTypes() {
                return [
                    {value: 'table', text: 'Таблица'},
                    {value: 'list', text: 'Список с фильтрами'},
                    {value: 'kanban', text: 'Канбан'},
                    {value: 'cli', text: 'Командная строка для гиков'},
                ]
            }
        }
    }
</script>

<style scoped>
    .card-details {
        background: #fff;
        position: relative;
        align-items: start;
    }

    @media (min-width: 960px) {
        .vacancy-fields {
            max-width: 900px!important;
        }
    }
    @media (min-width: 1264px) {
        .vacancy-fields {
            max-width: 900px!important;
        }
    }
    @media (min-width: 1904px) {
        .vacancy-fields {
            max-width: 1500px!important;
        }
    }

</style>