<template>
    <v-sheet>
        <v-list>
            <v-list-item v-for="(item, index) in newValue" :key="index" dense>
                <v-list-item-content>
                    <v-text-field v-model="item.text" label="Текст тэга" @input="sendUpdate" hide-details dense>
                        <template v-slot:append>
                            <v-menu v-model="item.isEditing" top :close-on-content-click="false">
                                <template v-slot:activator="{ on }">
                                    <div :style="swatchStyle(item)" v-on="on" />
                                </template>
                                <v-card>
                                    <v-card-text class="pa-0">
                                        <v-color-picker v-model="item.color" @input="changeColor(item)" flat hide-mode-switch hide-inputs/>
                                    </v-card-text>
                                </v-card>
                            </v-menu>
                        </template>
                    </v-text-field>
                </v-list-item-content>
                <v-list-item-action>
                    <v-btn icon @click="deleteItem(item)"><v-icon>mdi-delete</v-icon></v-btn>
                </v-list-item-action>
            </v-list-item>
        </v-list>
        <v-row>
            <v-col><v-btn text primary @click="addNewColor"><v-icon>mdi-plus</v-icon> Добавить новый тэг</v-btn></v-col>
        </v-row>
    </v-sheet>
</template>

<script>
    import {getDefaultColors} from "../../unsorted/Helpers";

    let defaultColors = getDefaultColors();

    export default {
        name: "ColorEdit",
        props: ['label', 'value', 'field',],
        data() {
            return {
                newValue: this.value || defaultColors
            }
        },
        methods: {
            sendUpdate() {
                this.$emit('input', this.newValue);
            },
            addNewColor() {
                let colorTemplate = {text: '', value: '#ffffff', color: '#ffffff', isEditing: false, defaultName: 'Новый цвет'};
                if (!this.newValue) {
                    this.newValue = [];
                }
                this.newValue.push(colorTemplate);
                this.sendUpdate();
            },
            deleteItem(item) {
                let index = this.newValue.indexOf(item);
                if (index !== -1) {
                    this.newValue.splice(index, 1);
                }
            },
            changeColor(item) {
                item.value = item.color;
                this.sendUpdate();
            },
            swatchStyle(item) {
                return {
                    backgroundColor: item.color,
                    border: '1px solid rgba(0, 0, 0, 0.42)',
                    cursor: 'pointer',
                    height: '25px',
                    width: '25px',
                    borderRadius: item.isEditing ? '50%' : '4px',
                    transition: 'border-radius 200ms ease-in-out'
                }
            }
        }
    }
</script>

<style scoped>

</style>