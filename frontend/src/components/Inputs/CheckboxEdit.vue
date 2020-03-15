<template>
    <v-sheet>
        <v-list>
            <v-list-item v-for="(item, index) in newValue" :key="index" dense>
                <v-list-item-content>
                    <v-text-field v-model="item.text" label="Текст галочки" @input="sendUpdate" hide-details dense></v-text-field>
                </v-list-item-content>
                <v-list-item-action>
                    <v-btn icon @click="deleteItem(item)"><v-icon>mdi-delete</v-icon></v-btn>
                </v-list-item-action>
            </v-list-item>
        </v-list>
        <v-row>
            <v-col><v-btn text primary @click="addNewCheckbox"><v-icon>mdi-plus</v-icon> Добавить новую галочку</v-btn></v-col>
        </v-row>
    </v-sheet>
</template>

<script>
    export default {
        name: "CheckboxEdit",
        props: ['value'],
        data() {
            return {
                newValue: this.value || [{text: 'Новая галочка'}]
            }
        },
        methods: {
            sendUpdate() {
                this.$emit('input', this.newValue);
            },
            addNewCheckbox() {
                let checkboxTemplate = {text: ''};
                this.newValue.push(checkboxTemplate);
                this.sendUpdate();
            },
            deleteItem(item) {
                let index = this.newValue.indexOf(item);
                if (index !== -1) {
                    this.newValue.splice(index, 1);
                }
            },
        }
    }
</script>