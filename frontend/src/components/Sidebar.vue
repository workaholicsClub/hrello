<template>
    <div>
        <v-navigation-drawer
                v-model="isDrawerVisible"
                dark
                :app="isDesktop"
                :permanent="isDesktop"
                fixed
                hide-overlay
                :mini-variant="isMini"
                mini-variant-width="52"
        >
            <v-row>
                <v-col class="full-height d-flex flex-column pt-0">
                    <v-list>
                        <v-list-item avatar>
                            <v-list-item-avatar color="white">
                                <v-img
                                        src="https://www.theodinproject.com/assets/odin-logo-94557650fea28e24cc04263ece9c08ab5956e0d344faa4d03cdb732e9f9983d4.svg"
                                        height="34"
                                        contain
                                />
                            </v-list-item-avatar>
                        </v-list-item>
                        <v-list-item class="p-0">
                            <v-list-item-action>
                                <v-btn icon outlined ><v-icon>mdi-bell-outline</v-icon></v-btn>
                            </v-list-item-action>
                            <v-list-item-title class="font-weight-light">
                                Напоминания
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item class="p-0">
                            <v-list-item-action>
                                <v-btn icon outlined ><v-icon>mdi-calendar-blank-outline</v-icon></v-btn>
                            </v-list-item-action>
                            <v-list-item-title class="font-weight-light">
                                Подключить календарь
                            </v-list-item-title>
                        </v-list-item>

                        <v-divider/>

                        <v-list-item class="p-0">
                            <v-list-item-action>
                                <v-btn icon outlined >ДУ</v-btn>
                            </v-list-item-action>
                            <v-list-item-title class="font-weight-light">
                                Доска Увольней
                            </v-list-item-title>
                        </v-list-item>

                    </v-list>
                    <v-spacer class="fill" />
                    <v-list>
                        <v-divider/>
                        <v-list-item class="p-0">
                            <v-list-item-action  v-if="isDesktop">
                                <v-btn icon @click.stop="mini = !mini">
                                    <v-icon v-if="isMini">mdi-chevron-double-right</v-icon>
                                    <v-icon v-else>mdi-chevron-double-left</v-icon>
                                </v-btn>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list>
                </v-col>
            </v-row>

        </v-navigation-drawer>
    </div>
</template>
<script>
    export default {
        name: 'Sidebar',
        props: ['drawer', 'isDesktop'],
        data() {
            return {
                isDrawerVisible: false,
                mini: this.isDesktop
            }
        },
        watch: {
            drawer() {
                this.isDrawerVisible = this.drawer;
            },
            isDrawerVisible() {
                this.$emit('drawer', this.isDrawerVisible);
            }
        },
        computed: {
            isMini() {
                return this.isDesktop ? this.mini : false;
            }
        }
    }
</script>
<style scoped>
    .theme--dark.v-navigation-drawer {
        background-color: #261440;
    }
    .theme--dark.v-divider {
        border-color: #1d7272;
        margin-left: 10px;
        margin-right: 10px;
    }
    .spacer.fill {
        flex: 1 1 auto !important;
    }
    .row, .col {
        height: 100%;
    }
    .v-navigation-drawer:not(.v-navigation-drawer--mini-variant) .v-btn--icon.v-size--default {
        min-width: 36px;
        margin-left: 12px;
    }
</style>