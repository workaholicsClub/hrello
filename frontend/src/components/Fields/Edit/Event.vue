<template>
    <v-sheet elevation="0" class="my-1 px-1 bordered">
        <v-form>
            <v-container fluid class="py-0">
                <v-row align="center">
                    <v-col class="d-flex py-0" cols="12">
                        <v-text-field
                                v-model="value.name"
                                label="Название события"
                                hide-details
                                @input="commitUpdate"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row class="d-flex" cols="12" v-if="!skipValueField">
                    <view-event v-model="value.value" :event="value"></view-event>
                </v-row>
                <v-row v-else>
                    <v-col class="d-flex pb-0" cols="12" sm="12">
                        <v-switch class="ma-2" v-model="value.isGlobal" label="Добавлять это поле в новые карточки доски" hide-details></v-switch>
                    </v-col>
                </v-row>

                <v-alert
                        v-if="value.linkToDefaultById"
                        dense
                        outlined
                        type="warning"
                        class="mb-0"
                >
                    {{value.isGlobal
                    ? 'Поле будет изменено в этой и новых карточках'
                    : 'Поле будет изменено только в этой карточке, а в новых останется прежним'}}
                </v-alert>
            </v-container>
        </v-form>
    </v-sheet>

</template>

<script>
    import ViewEvent from '../View/Event';

    export default {
        name: "EditEvent",
        props: ['value', 'skipGlobalSwitch'],
        components: {
            ViewEvent
        },
        data() {
            return {
                name: '',
                isGlobal: false
            }
        },
        methods: {
            commitUpdate() {
                this.$emit('input', this.value);
            },
            updateValueFromDateTime() {
                let parsedDate = this.date ? new Date(this.date) : null;
                let parsedTime = this.time ? new Date('01-01-01 '+this.time) : null;

                let dateTimeSelected = parsedDate && parsedTime;

                if (dateTimeSelected) {
                    parsedDate.setHours(parsedTime.getHours());
                    parsedDate.setMinutes(parsedTime.getMinutes());

                    this.event.value = this.date;
                }
            },
        },
        watch: {
            isGlobal() {
                this.event.isGlobal = this.isGlobal;
                this.commitUpdate();
            },
        },
        computed: {
            skipValueField() {
                return !this.skipGlobalSwitch;
            }
        }

    }
</script>

<style scoped>

</style>