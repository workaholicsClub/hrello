<template>
    <v-row>
        <v-col>
            <v-select :items="colors" :label="label" v-model="newValue" @change="sendUpdate">
                <template v-slot:selection="{ select, item }">
                    <v-chip :color="selectedColor">{{item.text}}</v-chip>
                </template>
                <template v-slot:item="{ on, item }">
                    <v-list-item :style="{'background-color': item.color}">
                        <v-text-field v-if="item.isEditing" v-model="item.text"></v-text-field>
                        <v-list-item-content  v-on="on" v-else v-text="item.text"></v-list-item-content>
                        <v-list-item-icon>
                            <v-icon v-if="item.isEditing" @click="stopEditing(item)">mdi-check</v-icon>
                            <v-icon v-else @click="startEditing(item)">mdi-pencil</v-icon>
                        </v-list-item-icon>
                    </v-list-item>
                </template>
            </v-select>
        </v-col>
    </v-row>
</template>

<script>
    import {clone} from "../../unsorted/Helpers";

    let defaultColors = [
        {text: '', value: 'green', color: '#519839', isEditing: false},
        {text: '', value: 'yellow', color: '#f2d600', isEditing: false},
        {text: '', value: 'orange', color: '#ff9f1a', isEditing: false},
        {text: '', value: 'red', color: '#eb5a46', isEditing: false},
        {text: '', value: 'purple', color: '#c377e0', isEditing: false},
        {text: '', value: 'blue', color: '#0079bf', isEditing: false}
    ];

    export default {
        name: "ColorSelect",
        props: ['label', 'value', 'localField', 'globalField'],
        data() {
            let fieldCopy = this.globalField
                ? clone(this.globalField)
                : clone(this.localField);

            return {
                newValue: this.localField ? this.localField.value : null,
                newField: fieldCopy,
                colors: fieldCopy.colors || defaultColors
            }
        },
        methods: {
            startEditing(item) {
                item.isEditing = true;
            },
            stopEditing(item) {
                item.isEditing = false;
                this.sendUpdate();
            },
            sendUpdate() {
                let updatedField = clone(this.newField);
                updatedField.colors = this.colors;
                let oldField = this.field;

                this.$emit('input', this.newValue, updatedField, oldField);
            }
        },
        computed: {
            field() {
                return this.globalField
                    ? this.globalField
                    : this.localField;
            },
            selectedColor() {
                let colors = this.field.colors || defaultColors;
                let currentColorCode = this.newValue || false;

                if (!currentColorCode) {
                    return null;
                }

                let selectedColorItem = colors.filter( item => item.value === currentColorCode )[0];
                return selectedColorItem ? selectedColorItem.color : null;
            }
        }
    }
</script>

<style scoped>

</style>