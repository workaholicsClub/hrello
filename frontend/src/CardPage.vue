<template>
    <v-app id="recrutto">
        <v-container fill-height fluid v-if="!initFinished">
            <v-row align="center" justify="center">
                <v-progress-circular
                        :size="70"
                        :width="7"
                        color="#261440"
                        indeterminate
                ></v-progress-circular>
            </v-row>
        </v-container>
        <v-container fill-height fluid v-else-if="!user">
            <v-row align="center" justify="center">
                <login
                        :error="loginError"
                        @login="login"
                        @register="register"
                        @google="googleLogin"
                ></login>
            </v-row>
        </v-container>
        <v-container fill-height fluid class="p-0" v-else>
            <Header
                    :is-desktop="true"
                    :title="currentCardTitle"
                    :show-back="false"
                    :allow-title-edit="false"
            >
                <template v-slot:menu>
                    <v-menu bottom left offset-x @click.native.stop.prevent>
                        <template v-slot:activator="{ on }">
                            <v-btn icon text v-on="on" @click.stop><v-icon>mdi-dots-vertical</v-icon></v-btn>
                        </template>
                        <v-list-item @click="logout">
                            <v-list-item-icon>
                                <v-icon>mdi-logout</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Выход</v-list-item-title>
                        </v-list-item>
                    </v-menu>
                </template>

            </Header>
            <smart-card v-if="currentCard" :input-card="currentCard" :key="cardRedrawIndex"></smart-card>
        </v-container>
    </v-app>
</template>

<script>
    import Header from './components/Header.vue'
    import Login from "./components/Login";

    import UserMixin from "./mixins/user";
    import CardsMixin from "./mixins/cards";
    import EventsMixin from "./mixins/events";
    import FieldsMixin from "./mixins/fields";
    import NavigationMixin from "./mixins/navigation";

    import SmartCard from "@/components/SmartCard";

    import moment from "moment";

    export default {
        name: "CardPage",
        props: ['useGoogleServices'],
        components: {
            SmartCard,
            Header,
            Login,
        },
        mixins: [
            CardsMixin,
            EventsMixin,
            FieldsMixin,
            UserMixin,
            NavigationMixin
        ],
        data() {
            return {
                drawer: this.$isDesktop(),
                mini: this.$isDesktop(),
                isDesktop: this.$isDesktop(),
                initFinished: false,
                showTimetable: false,
                showArchive: false,
                onlyCardMode: true,
                cardRedrawIndex: 0,
                statuses: [],
            }
        },
        methods: {
            async loadUrlData() {
                let [,cardId] = window.location.hash.split('/');
                let skipUrlUpdate = true;

                if (cardId) {
                    await this.changeCard(cardId, skipUrlUpdate);
                }
            },
        },
        async created() {
            moment.locale('ru');

            let localUser = this.checkAndLoadAuthorizedLocalUser();
            if (localUser) {
                this.finishLogin(localUser);
                await this.afterLogin();
            }
            else {
                let isGoogleUserSignedIn = await this.checkAndLoadAuthorizedGoogleUser();
                if (isGoogleUserSignedIn) {
                    await this.afterLogin();
                }
            }

            this.initFinished = true;
        },
    }
</script>

<style scoped>

</style>