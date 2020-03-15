<template>
    <v-sheet :elevation="0" class="my-1 px-1">
        <v-container fluid class="py-0">
            <v-row align="center">
                <v-col class="d-flex p-0" cols="12">

                    <v-container v-if="field.fieldType == 'text'" class="pt-2">
                        <v-text-field v-model="newValue" :label="field.name" hide-details outlined></v-text-field>
                    </v-container>

                    <v-container v-if="field.fieldType == 'checkbox'" class="checkbox-container p-2">
                        <v-label>{{field.name}}</v-label>
                        <v-checkbox v-for="(task, index) in field.tasks" v-model="newValue"
                                :label="task.text"
                                :value="task.text"
                                :key="index+task.text"
                                @change="saveValues()"
                                hide-details></v-checkbox>
                    </v-container>

                    <v-container v-if="field.fieldType == 'file'" class="p-0">
                        <v-container v-if="field && field.file" class="p-0">
                            <v-icon>mdi-paperclip</v-icon>
                            <v-label>{{field.name}}</v-label>
                            <v-btn link :href="getDownloadUrl(field)" color="success" class="ml-4 download-btn" text>
                                {{field.file.name}}
                                <v-icon right dark>mdi-cloud-download</v-icon>
                            </v-btn>
                        </v-container>

                        <v-row class="pt-2 pl-4" v-else>
                            <v-col cols="12" md="9" class="p-0">
                                <v-file-input v-model="file" :label="field.name" placeholder="Выбрать файл" hide-details dense full-width outlined></v-file-input>
                            </v-col>
                            <v-col cols="12" md="3" class="p-0">
                                <v-btn @click="sendFileUpload" text color="success" :disabled="!file" :loading="fileUploadStarted" class="ml-8 ml-md-0">
                                    Прикрепить
                                    <v-icon right dark>mdi-cloud-upload</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>

                    </v-container>

                    <div v-if="field.fieldType == 'mark'" class="marks-field px-3 pt-2">
                        <v-label>{{field.name}}</v-label>
                        <v-chip-group v-model="newValue">
                            <v-chip filter active-class="green white--text" class="my-0" v-for="(emoticon, index) in emoticons" :key="index">
                                {{emoticon}}
                            </v-chip>
                        </v-chip-group>
                    </div>

                    <color-select v-if="field.fieldType == 'color'"
                            v-model="newValue"
                            :label="field.name"
                            :field="field"
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
        props: ['field', 'onlyInput', 'value', 'card'],
        components: {ColorSelect},
        data() {
            let field = this.field;

            let parsedValue = field.fieldType === 'datetime'
                ? new Date(this.value)
                : this.value;

            if (field.fieldType === 'file') {
                parsedValue = null;
            }

            if (field.fieldType === 'checkbox') {
                if (!(parsedValue instanceof Array)) {
                    parsedValue = [];
                }
            }

            return {
                newValue: parsedValue,
                emoticons: ['👍', '👎', '😃', '😍', '😋','😒','😞', '😠', '😱'],
                file: null,
                fileUploadStarted: false,
                newField: field,
            }
        },
        methods: {
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
            getDownloadUrl(field) {
                if (field.googleDrive) {
                    return field.googleDrive.downloadUrl;
                }
                else {
                    return field.uploadData.downloadUrl;
                }
            },
            saveValues() {
                this.$emit('input', this.newValue, this.field);
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
                this.saveValues();
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

    .checkbox-container > .v-label {
        margin-bottom: 1rem!important;
    }

    .checkbox-container .v-input .v-label {
        margin-bottom: 0px!important;
    }
</style>