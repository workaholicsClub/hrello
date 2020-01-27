<template>
    <v-sheet :elevation="onlyInput ? 0 : 2" :class="{'py-1 px-4': !onlyInput, 'light-green lighten-4': isMarkedSuccess }">
        <v-container fluid>
            <v-row align="center">
                <v-col class="d-flex p-0" cols="12">

                    <v-text-field v-if="field.fieldType == 'text'" v-model="newValue" :label="field.name" hide-details outlined></v-text-field>

                    <v-checkbox v-if="field.fieldType == 'checkbox'" v-model="newValue" :label="field.name" hide-details></v-checkbox>

                    <v-container v-if="field.fieldType == 'file'" class="p-0">
                        <v-container v-if="localField && localField.file" class="p-0">
                            <v-icon>mdi-paperclip</v-icon>
                            <v-label>{{field.name}}</v-label>
                            <v-btn link :href="localField.googleDrive.downloadUrl" color="success" class="ml-4 download-btn" text>
                                {{localField.file.name}}
                                <v-icon right dark>mdi-cloud-download</v-icon>
                            </v-btn>
                        </v-container>

                        <v-row v-else class="p-0">
                            <v-col cols="12" md="9">
                                <v-file-input v-model="file" :label="field.name" hide-details full-width outlined></v-file-input>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-btn @click="sendFileUpload" text color="success" :disabled="!file" :loading="fileUploadStarted" class="ml-8 ml-md-0">
                                    Прикрепить
                                    <v-icon right dark>mdi-cloud-upload</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>

                    </v-container>

                    <div v-if="field.fieldType == 'mark'" class="marks-field">
                        <v-label>{{field.name}}</v-label>
                        <v-chip-group v-model="newValue">
                            <v-chip filter active-class="green white--text" v-for="(emoticon, index) in emoticons" :key="index">
                                {{emoticon}}
                            </v-chip>
                        </v-chip-group>
                    </div>

                    <color-select v-if="field.fieldType == 'color'"
                            v-model="newField"
                            :label="field.name"
                            :local-field="localField"
                            :global-field="globalField"
                            @input="reemitFieldInput"
                    ></color-select>

                </v-col>
            </v-row>
        </v-container>
    </v-sheet>
</template>

<script>
    import ColorSelect from "../../Inputs/ColorSelect";

    export default {
        name: "ViewField",
        props: ['localField', 'globalField', 'onlyInput', 'value', 'card'],
        components: {ColorSelect},
        data() {
            let field = this.localField;

            if (this.globalField && this.globalField.isGlobal) {
                parsedValue = this.globalField;
                field = this.globalField;
            }

            let parsedValue = field.fieldType === 'datetime'
                ? new Date(this.value)
                : this.value;

            if (field.fieldType === 'file') {
                parsedValue = null;
            }

            return {
                newValue: parsedValue,
                emoticons: ['👍', '👎', '😃', '😍', '😋','😒','😞', '😠', '😱'],
                file: null,
                fileUploadStarted: false,
                newField: field,
                field: field
            }
        },
        methods: {
            activeEvents (date) {
                const [,, day] = date.split('-');
                if ([12, 17, 28].includes(parseInt(day, 10))) return true;
                if ([1, 19, 22].includes(parseInt(day, 10))) return ['red', '#00f'];
                return false;
            },
            sendFileUpload() {
                if (this.file) {
                    this.$root.$emit('fileUpload', {
                        field: this.field,
                        localField: this.localField,
                        card: this.card,
                        file: this.file
                    });
                    this.fileUploadStarted = true;
                }
            },
            reemitFieldInput(newValue, updatedField, oldField) {
                this.$emit('inputField', newValue, updatedField, oldField);
            }
        },
        watch: {
            field: {
                handler() {
                    this.newValue = this.field.value;
                    this.newField = this.field;
                },
                deep: true
            },
            newValue() {
                this.$emit('input', this.newValue, this.field);
            }
        },
        computed: {
            isMarkedSuccess() {
                return (Boolean(this.newValue) || this.field.file) && !this.onlyInput;
            }
        }
    }
</script>

<style scoped>
    .v-input--selection-controls {
        margin-top: 0;
        padding-top: 0;
    }

    .v-chip.v-size--default {
        font-size: 24px;
    }

    .download-btn {
        max-width: 50vw;
        overflow: hidden;
        justify-content: flex-end;
    }

</style>
<style>
    .marks-field .v-chip-group .v-slide-group__content {
        flex: auto;
        flex-wrap: wrap;
    }
</style>