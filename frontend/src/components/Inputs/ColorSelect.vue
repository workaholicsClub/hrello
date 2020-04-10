<template>
    <v-row class="px-3">
        <v-col class="pb-0 pt-2">
            <v-select :items="colors" :label="label" v-model="newValue" multiple clearable hide-details dense @change="sendUpdate">
                <template v-slot:selection="{ select, item }">
                    <v-chip :color="item.color">{{item.text || getColorName(item.value)}}</v-chip>
                </template>
                <template v-slot:item="{ on, item, parent }">
                    <v-list-item :style="{'background-color': item.color}">
                        <v-list-item-action>
                            <v-simple-checkbox @input="parent.$emit('select', item)" :value="isColorSelected(item.value)" :ripple="false"></v-simple-checkbox>
                        </v-list-item-action>
                        <v-list-item-content  v-on="on">
                            <v-list-item-title>{{item.text || getColorName(item.value)}}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </template>
            </v-select>
        </v-col>
    </v-row>
</template>

<script>
    export default {
        name: "ColorSelect",
        props: ['label', 'value', 'field',],
        data() {
            return {
                newValue: this.field.value,
                colors: this.field.colors
            }
        },
        watch: {
            field: {
                async handler() {
                    this.colors = this.field.colors;
                },
                deep: true
            },
        },
        methods: {
            sendUpdate() {
                this.$emit('input', this.newValue);
            },
            findColorData(colorCode) {
                let colors = this.field.colors;

                return colors.filter( item => item.value === colorCode )[0] || false;
            },
            getColorName(colorCode) {
                let color = this.findColorData(colorCode);
                return color.defaultName;
            },
            isColorSelected(colorCode) {
                return this.newValue ? this.newValue.indexOf(colorCode) !== -1 : false;
            }
        },
        computed: {
            selectedColor() {
                let currentColorCode = this.newValue || false;

                if (!currentColorCode) {
                    return null;
                }

                let selectedColorItem = this.findColorData(currentColorCode);
                return selectedColorItem ? selectedColorItem.color : null;
            }
        }
    }
</script>

<style scoped>

</style>