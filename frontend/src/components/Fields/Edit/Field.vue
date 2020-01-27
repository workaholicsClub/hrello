<template>
    <v-sheet elevation="10" class="py-1 px-4">
        <v-form>
            <v-container fluid>
                <v-row align="center">
                    <v-col class="d-flex" cols="12" sm="3">
                        <v-select
                                :items="items"
                                v-model="type"
                                outlined
                                label="Тип поля"
                        >
                            <template v-slot:item="{ on, item }">
                                <span v-on="on"><v-btn icon><v-icon>{{item.icon}}</v-icon></v-btn> {{item.text}}</span>
                            </template>
                        </v-select>
                    </v-col>

                    <v-col class="d-flex" cols="12" sm="3">
                        <v-switch class="ma-2" v-model="isGlobal" label="Для всех карточек"></v-switch>
                    </v-col>

                    <v-col class="d-flex" cols="12" sm="6">
                        <v-text-field
                                v-model="name"
                                label="Название поля"
                                :disabled="isTemplateType"
                        ></v-text-field>
                    </v-col>
                </v-row>
            </v-container>
        </v-form>
    </v-sheet>
</template>

<script>
    export default {
        name: "EditField",
        props: ['value'],
        data() {
            return {
                name: '',
                type: false,
                isGlobal: false,
                field: this.value,
                items: [
                    {text: 'Текст', value: 'text', icon: 'mdi-cursor-text'},
                    {text: 'Галочка', value: 'checkbox', icon: 'mdi-checkbox-marked-outline'},
                    {text: 'Оценка', value: 'mark', icon: 'mdi-emoticon-happy-outline'},
                    {text: 'Файл', value: 'file', icon: 'mdi-paperclip'},
                    {text: 'Цвет', value: 'color', icon: 'mdi-palette'},
                    {text: 'Резюме', value: 'resume', icon: 'mdi-paperclip', fieldName: 'Резюме', fieldType: 'file', template: true}
                ],
            }
        },
        methods: {
            commitUpdate() {
                this.$emit('input', this.field);
            },
            getTypeData(type) {
                return this.items.filter(data => data.value === type)[0] || false;
            }
        },
        watch: {
            name() {
                this.field.name = this.name;
                this.commitUpdate();
            },
            type() {
                let typeData = this.getTypeData(this.type);
                if (typeData && typeData.template) {
                    this.name = typeData.fieldName;
                    this.field.name = typeData.fieldName;
                    this.field.fieldType = typeData.fieldType;
                }
                else {
                    this.field.fieldType = this.type;
                }

                this.commitUpdate();
            },
            isGlobal() {
                this.field.isGlobal = this.isGlobal;
                this.commitUpdate();
            },
        },
        computed: {
            isTemplateType() {
                let typeData = this.getTypeData(this.type);
                return typeData.template && typeData.template === true;
            }
        }
    }
</script>

<style scoped>

</style>