<template>
    <div class="white board-view-menu">
        <v-list>
            <v-subheader style="{font-weight: bold}">Внешний вид</v-subheader>
            <v-list-item-group :value="typeIndex">
                <v-list-item @click="sendChangeBoardTypeEvent('kanban')">
                    <v-list-item-icon>
                        <v-icon>mdi-trello</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Канбан</v-list-item-title>
                </v-list-item>
                <v-list-item @click="sendChangeBoardTypeEvent('list')" >
                    <v-list-item-icon>
                        <v-icon>mdi-view-list</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Списком</v-list-item-title>
                </v-list-item>
                <v-list-item @click="sendChangeBoardTypeEvent('table')">
                    <v-list-item-icon>
                        <v-icon>mdi-table</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Таблицей</v-list-item-title>
                </v-list-item>
                <v-list-item @click="sendChangeBoardTypeEvent('cli')">
                    <v-list-item-icon>
                        <v-icon>mdi-console-line</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>С командной строкой</v-list-item-title>
                </v-list-item>
            </v-list-item-group>
        </v-list>
        <v-divider></v-divider>
        <v-list v-if="board.type === 'table'">
            <v-subheader>Показывать в таблице</v-subheader>
            <v-list-item v-for="field in activePinnedFields" :key="field.id">
                <v-list-item-title>{{field.name}}</v-list-item-title>
                <v-list-item-action>
                    <v-switch :input-value="shownInTable(field)" color="success" inset @change="updateFieldHidden(field)" @click.native.stop.prevent></v-switch>
                </v-list-item-action>
            </v-list-item>
        </v-list>
        <v-list v-else>
            <v-subheader>Показывать на карточке</v-subheader>
            <v-list-item>
                <v-list-item-title>Данные</v-list-item-title>
                <v-list-item-action>
                    <v-switch v-model="showStatus.info" color="success" inset @change="updateShowStatus" @click.native.stop.prevent></v-switch>
                </v-list-item-action>
            </v-list-item>
            <v-list-item>
                <v-list-item-title>#Хэштеги</v-list-item-title>
                <v-list-item-action>
                    <v-switch v-model="showStatus.hashtags" color="success" inset @change="updateShowStatus" @click.native.stop.prevent></v-switch>
                </v-list-item-action>
            </v-list-item>
            <v-list-item>
                <v-list-item-title>$Медали</v-list-item-title>
                <v-list-item-action>
                    <v-switch v-model="showStatus.achievements" color="success" inset @change="updateShowStatus" @click.native.stop.prevent></v-switch>
                </v-list-item-action>
            </v-list-item>
            <v-list-item>
                <v-list-item-title>Этап</v-list-item-title>
                <v-list-item-action>
                    <v-switch v-model="showStatus.status" color="success" inset @change="updateShowStatus" @click.native.stop.prevent></v-switch>
                </v-list-item-action>
            </v-list-item>
            <v-list-item>
                <v-list-item-title>Последний комментарий</v-list-item-title>
                <v-list-item-action>
                    <v-switch v-model="showStatus.lastComment" color="success" inset @change="updateShowStatus" @click.native.stop.prevent></v-switch>
                </v-list-item-action>
            </v-list-item>
            <v-list-item>
                <v-list-item-title>Кнопки</v-list-item-title>
                <v-list-item-action>
                    <v-switch v-model="showStatus.buttons" color="success" inset @change="updateShowStatus" @click.native.stop.prevent></v-switch>
                </v-list-item-action>
            </v-list-item>
        </v-list>
    </div>
</template>

<script>
    import {clone} from "@/unsorted/Helpers";

    export default {
        name: "BoardViewMenu",
        props: ['board'],
        data() {
            return {
                showStatus: this.board.show || {},
            }
        },
        methods: {
            sendChangeBoardTypeEvent(newType) {
                this.$root.$emit('changeBoardType', newType, this.board);
            },
            updateShowStatus() {
                this.$store.dispatch('updateShowStatus', {board: this.board, newShowStatus: this.showStatus});
            },
            updateFieldHidden(field) {
                let updatedField = clone(field);
                updatedField.isTableHidden = !updatedField.isTableHidden;
                this.$store.dispatch('updatePinnedField', {board: this.board, field: updatedField});
            },
            shownInTable(field) {
                if (typeof (field.isTableHidden) === 'undefined') {
                    return true;
                }

                return !field.isTableHidden;
            }
        },
        computed: {
            typeIndex() {
                return ['kanban', 'list', 'table', 'cli'].indexOf( this.board.type );
            },
            activePinnedFields() {
                return this.$store.getters.activePinnedFields(this.board);
            }
        }
    }
</script>

<style>
    .board-view-menu .v-icon {
        /*color: #261440!important;*/
    }
</style>