<template>
    <div class="taglist-component" v-show="visible">
        <v-card tile>
            <v-list>
                <v-list-item-group :value="navigatedIndex" color="primary">
                    <template>
                        <v-list-item
                                v-for="(item, index) in items"
                                :key="index"
                                class="suggestion-list__item"
                                @click="selectItem(index)"
                        >
                            <v-list-item-icon v-if="item.icon">
                                <v-icon v-text="item.icon"></v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>{{ item.text }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item
                                v-if="canAdd"
                                class="suggestion-list__item"
                                @click="addNewItem"
                        >
                            <v-list-item-content>
                                <v-list-item-title>Добавить новый...</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-list-item-group>
            </v-list>
        </v-card>
    </div>
</template>

<script>
    export default {
        name: "TagListComponent",
        props: ['navigatedIndex', 'items', 'listCode', 'visible', 'canAdd'],
        data() {
            return {
            }
        },
        methods: {
            selectItem(index) {
                this.$emit('select', index, this.listCode);
            },
            addNewItem() {
                this.$emit('add', this.listCode);
            }
        },
        computed: {
            hasResults() {
                return this.items && this.items.length > 0;
            },
        }

    }
</script>

<style scoped>

</style>