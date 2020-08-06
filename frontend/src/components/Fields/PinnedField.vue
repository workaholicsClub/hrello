<template>
    <v-row>
        <v-col cols="1" class="middle-col py-2">
            <v-icon v-if="icon">{{icon}}</v-icon>
        </v-col>
        <v-col cols="5" class="middle-col edit-on-hover py-2">
            <v-text-field v-if="isTitleEditing" v-model="name" placeholder="Название поля" hide-details dense></v-text-field>
            <span v-else>{{name}}</span>

            <v-btn v-if="isTitleEditing" small icon @click="updateName" class="ml-2"><v-icon>mdi-check</v-icon></v-btn>
            <div v-else>
                <v-btn small icon @click="isTitleEditing = true" class="ml-2 edit-btn"><v-icon>mdi-pencil</v-icon></v-btn>
                <v-btn v-if="isDeletable" small icon @click="deleteField" class="ml-2 edit-btn"><v-icon>mdi-delete</v-icon></v-btn>
                <v-btn v-else small icon @click="hideField" class="ml-2 edit-btn"><v-icon>mdi-eye-off</v-icon></v-btn>
            </div>
        </v-col>
        <v-col cols="6" class="py-2">
            <v-text-field v-model="value" hide-details dense placeholder="Добавить значение" @input="updateValue"></v-text-field>
        </v-col>
    </v-row>
</template>

<script>
    export default {
        name: "PinnedField",
        props: ['field', 'card'],
        data() {
            return {
                isTitleEditing: !this.field.name,
                name: this.field.name,
                value: this.field.value
            }
        },
        watch: {
            field: {
                deep: true,
                handler() {
                    this.name = this.field.name;
                    this.value = this.field.value;
                }
            }
        },
        computed: {
            icon() {
                let lcValue = this.field && this.field.value ? this.field.value.toString().toLocaleLowerCase() : '';
                let lcName = this.field && this.field.name ? this.field.name.toString().toLocaleLowerCase() : '';

                if (lcName.indexOf('плата') !== -1) {
                    return 'mdi-tag-outline';
                }

                if (lcName.indexOf('телефон') !== -1) {
                    return 'mdi-phone-outline';
                }

                if (lcName.indexOf('город') !== -1) {
                    return 'mdi-map-marker-outline';
                }

                if (lcName.indexOf('возраст') !== -1 || lcName.indexOf('рожден') !== -1 || lcName.indexOf('стаж') !== -1 || lcName.indexOf('опыт') !== -1) {
                    return 'mdi-clock-outline';
                }

                if (lcName.indexOf('позиц') !== -1 || lcName.indexOf('должност') !== -1) {
                    return 'mdi-briefcase-outline';
                }

                if (lcName.match(/(e[- ]*mail|почта)/i)) {
                    return 'mdi-email-outline';
                }

                if (lcValue.match(/https*:\/\//i)) {
                    return 'mdi-link-variant';
                }

                return false;
            },
            board() {
                return this.$store.getters.boardByCard(this.card);
            },
            isDeletable() {
                return this.$store.getters.isPinnedFieldDeletable(this.field);
            }
        },
        methods: {
            updateName() {
                let board = this.board;
                this.$store.dispatch('updatePinnedName', {board, field: this.field, newName: this.name});
                this.isTitleEditing = false;
                this.emitStateChange();
            },
            updateValue() {
                this.$store.dispatch('updatePinnedValue', {card: this.card, field: this.field, value: this.value});
            },
            emitStateChange() {
                this.$emit('state');
            },
            async hideField() {
                await this.$store.dispatch('hidePinned', {board: this.board, field: this.field});
                this.emitStateChange();
            },
            async deleteField() {
                await this.$store.dispatch('deletePinned', {board: this.board, field: this.field});
                this.emitStateChange();
            }
        }
    }
</script>

<style scoped>
    .middle-col {
        display: flex;
        align-items: center;
    }

    .edit-on-hover .edit-btn {
        display: none;
    }

    .edit-on-hover:hover .edit-btn {
        display: inline-flex;
    }
</style>