<template>
    <v-row class="pl-4 mt-4">
        <v-dialog v-model="dialog" persistent max-width="50vw">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                        color="success"
                        outlined
                        rounded
                        v-bind="attrs"
                        v-on="on"
                >
                    Сохранить фильтр как группу
                </v-btn>
            </template>
            <v-card>
                <v-card-title class="headline">Создать группу</v-card-title>
                <v-card-text>
                    Группы позволяют показать текущих кандидатов, собранных по вашим правилам. Всего одним кликом
                    вы можете вывести кандидатов с тэгом "#срочно", или всех кандидатов на удаленку.
                </v-card-text>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field label="Название*" required v-model="group.name"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="success" rounded outlined text large @click="hideDialog">Отмена</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="success" rounded elevation="0" large @click="commitNewGroup">Создать</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>
    export default {
        name: "NewGroupDialog",
        data () {
            return {
                dialog: false,
                group: {
                    name: '',
                }
            }
        },
        methods: {
            hideDialog() {
                this.dialog = false;
            },
            commitNewGroup() {
                this.hideDialog();
                this.$emit('newGroup', this.group);
            }
        }
    }
</script>

<style scoped>

</style>