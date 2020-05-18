<template>
    <v-sheet elevation="0" class="my-1 px-1 bordered">
        <v-form>
            <v-container fluid class="py-0">
                <v-row align="center" v-if="field.fieldType !== 'task'">
                    <v-col class="d-flex py-0" cols="12" sm="12">
                        <v-text-field
                                v-model="field.name"
                                label="Название поля"
                                hide-details
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row v-if="field.fieldType === 'color'">
                    <v-col>
                        <color-edit v-model="field.colors"></color-edit>
                    </v-col>
                </v-row>
                <v-row v-if="field.fieldType === 'checkbox'">
                    <v-col>
                        <checkbox-edit v-model="field.tasks"></checkbox-edit>
                    </v-col>
                </v-row>
                <v-row v-if="field.fieldType === 'task'">
                    <v-col>
                        <task-edit v-model="field.task"></task-edit>
                    </v-col>
                </v-row>
                <v-alert
                        v-if="field.linkToDefaultById"
                        dense
                        outlined
                        type="warning"
                        class="mb-0"
                >
                    {{field.isGlobal
                        ? 'Поле будет изменено в этой и новых карточках'
                        : 'Поле будет изменено только в этой карточке, а в новых останется прежним'}}
                </v-alert>
            </v-container>
        </v-form>
    </v-sheet>
</template>

<script>
    import {getFieldTypes, getDefaultColors} from "../../../unsorted/Helpers";
    import ColorEdit from "../../Inputs/ColorEdit";
    import CheckboxEdit from "../../Inputs/CheckboxEdit";
    import TaskEdit from "../../Inputs/TaskEdit";

    let defaultColors = getDefaultColors();

    export default {
        name: "EditField",
        props: ['value', 'userIsAuthor', 'skipGlobal'],
        components: {
            ColorEdit,
            CheckboxEdit,
            TaskEdit
        },
        data() {
            return {
                name: this.value.name,
                type: this.value.fieldType,
                isGlobal: false,
                field: this.value,
                items: getFieldTypes(),
            }
        },
        created() {
            this.ensureColorsInColorField();
        },
        methods: {
            ensureColorsInColorField() {
                if (this.field.fieldType === 'color') {
                    if (!this.field.colors) {
                        this.field.colors = defaultColors;
                        this.commitUpdate();
                    }
                }
            },
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
            field: {
                deep: true,
                handler() {
                    this.commitUpdate();
                }
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