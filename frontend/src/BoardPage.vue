<template>
    <v-app id="hrello" v-resize="watchResize">
        <v-alert type="error" v-model="showError" dismissible tile class="global-error">{{appError}}</v-alert>

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
        <v-container fill-height v-else-if="hasNoBoards">
            <Sidebar
                    :drawer="drawer"
                    :is-desktop="isDesktop"
                    :user="user"
                    @drawer="setDrawerState"
                    @logout="logout"
            ></Sidebar>
            <v-row align="center" justify="center">
                <v-col class="text-center">
                    <p class="display-1">Добро пожаловать!</p>
                    <p class="headline p-0">Для начала нужно</p>
                    <v-btn x-large dark @click="addNewBoard">Создать первую вакансию</v-btn>
                </v-col>
            </v-row>
        </v-container>
        <v-container fill-height fluid class="p-0" v-else>
            <Sidebar
                :drawer="drawer"
                :is-desktop="isDesktop"
                :boards="boards"
                :user="user"
                :active-item="currentBoard ? 'board'+currentBoard.id : false"
                @drawer="setDrawerState"
                @changeBoard="changeBoard"
                @logout="logout"
            ></Sidebar>
            <Header
                    :is-desktop="isDesktop"
                    @drawer="toggleDrawer"
                    @back="goBack"
                    @input="setBoardTitle"
            ></Header>

            <router-view></router-view>
        </v-container>

        <v-dialog v-model="shareDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline" v-if="shareCard">Ссылка на карточку</span>
                    <span class="headline" v-if="shareBoard">Ссылка на вакансию</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-textarea
                                v-if="shareCard"
                                outlined
                                hide-details
                                readonly
                                rows="3"
                                :value="cardShareLink"
                        ></v-textarea>
                        <v-textarea
                                v-if="shareBoard"
                                outlined
                                hide-details
                                readonly
                                rows="3"
                                :value="boardShareLink"
                        ></v-textarea>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="pink darken-1" dark @click="closeShareDialog">Закрыть</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>

</template>

<script>
    import Header from './components/Header.vue';
    import Sidebar from './components/Sidebar.vue';
    import Login from "./components/Login";

    import CardsMixin from "./mixins/cards";
    import BoardsMixin from "./mixins/boards";
    import StatusMixin from "./mixins/statuses";
    import EventsMixin from "./mixins/events";
    import FieldsMixin from "./mixins/fields";
    import UserMixin from "./mixins/user";
    import NavigationMixin from "./mixins/navigation";

    import axios from 'axios';
    import moment from 'moment';

    export default {
        name: 'BoardPage',
        props: ['useGoogleServices', 'globalError'],
        components: {
            Header,
            Sidebar,
            Login,
        },
        mixins: [
            CardsMixin,
            BoardsMixin,
            StatusMixin,
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
                onlyCardMode: false,
                cardRedrawIndex: 0,
                teamMates: [],
                statuses: [],
                showError: false,
            }
        },
        watch: {
            appError() {
                this.showError = true;
            }
        },
        methods: {
            toggleDrawer() {
                this.drawer = !this.drawer;
            },
            setDrawerState(newState) {
                this.drawer = newState;
            },
            setDrawerStateOnResizeToDesktop() {
                this.drawer = true;
            },
            setDrawerStateOnResizeToMobile() {
                this.drawer = false;
            },
            watchResize() {
                let scaleChanged = this.isDesktop !== this.$isDesktop();
                if (scaleChanged) {
                    this.isDesktop = this.$isDesktop();

                    if (this.isDesktop) {
                        this.setDrawerStateOnResizeToDesktop();
                    } else {
                        this.setDrawerStateOnResizeToMobile();
                    }
                }
            },

            parseUrlParts() {
                let hashParts = window.location.hash.split('/');
                return {
                    boardId: hashParts[1] || false,
                    cardId: hashParts[2] || false,
                }
            },
            async loadUrlData() {
                let hashParts = this.parseUrlParts();
                let skipUrlUpdate = true;

                if (hashParts.boardId) {
                    await this.changeBoard(hashParts.boardId, skipUrlUpdate);
                }

                if (hashParts.cardId) {
                    await this.changeCard(hashParts.cardId, skipUrlUpdate);
                }
            },

            async loadGlobalObject(objectCode) {
                if (!this.currentBoardId && !this.user) {
                    return false;
                }

                let params = {};
                if (this.user) {
                    params['userId'] = this.user.id;
                }

                if (this.currentBoardId) {
                    params['boardIds'] = [this.currentBoardId];
                }

                let response = await axios.get(`/api/${objectCode}/listGlobal`, {
                    params: params
                });

                let objectCodePlural = objectCode+'s';
                return response.data[objectCodePlural];
            },
            async loadBoardStatuses(boardId) {
                let statusesResponse = await axios.get('/api/status/list', {
                    params: {
                        boardId: boardId
                    }
                });

                return statusesResponse.data.status;
            },
            async loadAndUpdateBoardStatuses() {
                this.statuses = await this.loadBoardStatuses(this.currentBoardId);
            },
            async goBack() {
                if (this.currentCard) {
                    await this.saveCard(this.currentCard);
                }

                if (this.showVacancyEditor) {
                    await this.saveCurrentBoard();
                    this.showVacancyEditor = false;
                }

                this.$router.back();
            },

            showShareBoardDialog(board) {
                this.shareCard = null;
                this.shareBoard = board;
                this.shareDialog = true;
            },
            showShareCardDialog(card) {
                this.shareCard = card;
                this.shareBoard = null;
                this.shareDialog = true;
            },
            closeShareDialog() {
                this.shareDialog = false;
                this.shareBoard = null;
                this.shareCard = null;
            },
        },
        computed: {
            appError() {
                return this.$store.state.appError;
            },
            showFilterDrawer() {
                return this.$store.state.showFilterDrawer;
            },
            cardShareLink() {
                return this.shareCard ? location.origin + '/c#!/invite/card/'+this.shareCard.id : false;
            },
            boardShareLink() {
                return this.shareBoard ? location.origin + '/b#!/invite/board/'+this.shareBoard.id : false;
            },
        },
        async created() {
            moment.locale('ru');

            let localUser = this.checkAndLoadAuthorizedLocalUser();
            if (localUser) {
                await this.finishLogin(localUser);
                await this.afterLogin();
            }
            else {
                let isGoogleUserSignedIn = await this.checkAndLoadAuthorizedGoogleUser();
                if (isGoogleUserSignedIn) {
                    await this.afterLogin();
                }
            }

            this.loadTimetableEvents();

            this.initFinished = true;
        },
        mounted() {
            this.$root.$on('shareCard', this.showShareCardDialog);
            this.$root.$on('shareBoard', this.showShareBoardDialog);
        },
        beforeDestroy() {
            this.$root.$off('shareCard', this.showShareCardDialog);
            this.$root.$off('shareBoard', this.showShareBoardDialog);
        }
    }
</script>

<style>
    #hrello {
        background-color: #e7f2f5;
    }

    :root {
        --success: #16d1a5!important;
    }

    .global-error {
        position: absolute;
        z-index: 1000;
        width: 100%;
    }
</style>
