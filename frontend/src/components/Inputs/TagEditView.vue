<template>
    <span class="tag-edit-view">

        <v-text-field v-if="edit && isExtendedChip"
                v-model="text" dense hide-details outlined solo
                :style="'background: '+color" ref="input" :dark="isDark"
                @change="updateEditorValue"
                @keydown="passFocus"
        >
            <template v-slot:prepend-inner>
                <v-select dense hide-details :items="icons" v-model="icon" class="v-select__icon" @change="updateEditorValue">
                    <template v-slot:item="{on, item}">
                        <v-icon v-on="on" v-text="item"></v-icon>
                    </template>
                    <template v-slot:selection="{on, item}">
                        <v-icon v-on="on" v-text="item"></v-icon>
                    </template>
                </v-select>
            </template>
            <template v-slot:append>
                <v-menu v-model="showColorPicker" top :close-on-content-click="false">
                    <template v-slot:activator="{ on }">
                        <div class="swatch" :style="swatchStyle" v-on="on" />
                    </template>
                    <v-card>
                        <v-card-text class="pa-0">
                            <v-color-picker v-model="color" :swatches="swatches" flat show-swatches hide-mode-switch hide-inputs @input="updateEditorValue"/>
                        </v-card-text>
                    </v-card>
                </v-menu>
            </template>
        </v-text-field>
        <v-text-field v-else-if="edit"
                v-model="text" dense hide-details outlined solo ref="input"
                @change="updateEditorValue"
                @keydown="passFocus"
        >
            <template v-slot:prepend-inner>
                <span>{{node.attrs.matcherChar}}</span>
            </template>
        </v-text-field>
        <span v-else
                :data-icon="icon"
                :data-color="color"
                :data-text="text"
                :data-edit="edit ? '1' : '0'"
                :style="'background-color: '+color"
                :class="nodeClasses"
        >{{tagText}}</span>
    </span>
</template>

<script>
    import {contrastRatio, HexToRGBA} from 'vuetify/lib/util/colorUtils';

    export default {
        name: "TagEditView",
        props: ['node', 'updateAttrs', 'view', 'selected', 'getPos'],
        data() {
            return {
                icon: this.node.attrs.icon,
                color: this.node.attrs.color,
                text: this.node.attrs.text,
                edit: this.node.attrs.edit,

                icons: ['mdi-forum-outline', 'mdi-cash', 'mdi-bee', 'mdi-alert-circle', 'mdi-anchor', 'mdi-baketball', 'mdi-cake-variant', 'mdi-duck'],

                showColorPicker: false,
                swatches: [
                    ['#FF0000', '#AA0000', '#550000'],
                    ['#FFFF00', '#AAAA00', '#555500'],
                    ['#00FF00', '#00AA00', '#005500'],
                    ['#00FFFF', '#00AAAA', '#005555'],
                    ['#0000FF', '#0000AA', '#000055'],
                ],
            }
        },
        watch: {
            node: {
                deep: true,
                handler() {
                    this.icon = this.node.attrs.icon;
                    this.color = this.node.attrs.color;
                    this.text = this.node.attrs.text;
                    this.edit = this.node.attrs.edit;
                }
            },
            selected() {
                if (this.selected) {
                    this.focusField();
                }
            },
        },
        methods: {
            focusField() {
                this.$refs.input.focus();
            },
            focusEditor() {
                this.view.focus();
            },
            passFocus(event) {
                switch (event.key) {
                    case 'ArrowLeft':
                    case 'ArrowRight':
                        this.passFocusToEditorIfNeeded(event);
                        break;
                }
            },
            passFocusToEditorIfNeeded(event) {
                let lastPosition = event.target.value.length;
                let isCursorAtStart = event.target.selectionStart === 0;
                let isCursorAtEnd = event.target.selectionEnd === lastPosition;
                let isMovingLeft = event.key === "ArrowLeft";
                let isMovingRight = event.key === "ArrowRight";

                if (isCursorAtStart && isMovingLeft) {
                    this.focusEditor();
                }
                else if (isCursorAtEnd && isMovingRight) {
                    this.focusEditor();
                }
            },

            updateEditorValue() {
                this.updateAttrs({
                    icon: this.icon,
                    color: this.color,
                    text: this.text
                });
            },
            saveAndFinishEdit() {
                this.updateAttrs({
                    icon: this.icon,
                    color: this.color,
                    text: this.text,
                    edit: false
                });
            },
        },
        computed: {
            isDark() {
                let rgbaColor = HexToRGBA(this.color);
                let white = { r: 255, g: 255, b: 255, a: 0 };
                return contrastRatio(rgbaColor, white) > 2
            },
            isExtendedChip() {
                return Boolean(this.node.attrs.icon);
            },
            nodeClasses() {
                let classes = {
                    'tag-chip': this.isExtendedChip,
                    'mdi': this.isExtendedChip,
                }

                let tagClass = this.node.attrs.tagClass;
                classes[tagClass] = true;

                if (this.isExtendedChip) {
                    classes[this.node.attrs.icon] = true;
                }

                return classes;
            },
            swatchStyle() {
                return {
                    backgroundColor: this.color,
                    borderRadius: this.showColorPicker ? '50%' : '4px',
                }
            },
            tagText() {
                return (this.isExtendedChip ? '' : this.node.attrs.matcherChar) + this.text;
            }

        }
    }
</script>

<style>
    .tag-edit-view {
        max-width: 300px;
        display: inline-block;
    }

    .v-select__icon {
        max-width: 52px;
    }

    .tag-edit-view .v-input legend {
        display: none!important;
    }

    .tag-edit-view .v-input fieldset {
        top: 0px;
    }

    .tag-edit-view .theme--light.v-text-field > .v-input__control > .v-input__slot:before,
    .tag-edit-view .theme--dark.v-text-field > .v-input__control > .v-input__slot:before {
        border: none!important;
    }

    .tag-edit-view .v-input__slot .v-input__slot {
        min-height: auto;
    }

    .v-text-field.v-text-field--solo .v-input__prepend-inner .v-input__control {
        min-height: auto;
    }

    .tag-edit-view .v-input__prepend-inner .v-text-field.v-text-field--solo .v-input__control {
        min-height: auto;
    }

    .tag-edit-view .v-text-field.v-text-field--enclosed > .v-input__control > .v-input__slot {
        padding: 0px 12px;
    }

    .tag-edit-view .theme--light.v-text-field--solo > .v-input__control > .v-input__slot,
    .tag-edit-view .theme--dark.v-text-field--solo > .v-input__control > .v-input__slot {
        background: none;
    }

    .swatch {
        border: 1px solid rgba(0, 0, 0, 0.42);
        cursor: pointer;
        height: 25px;
        width: 25px;
        transition: border-radius 200ms ease-in-out;
    }

    .theme--dark .swatch {
        border: 1px solid rgba(255, 255, 255, 0.42);
    }
</style>