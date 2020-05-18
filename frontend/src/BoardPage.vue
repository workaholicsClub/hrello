<template>
    <v-app id="hrello" v-resize="watchResize">
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
                    <v-btn x-large dark @click="addNewBoard">Создать первую доску</v-btn>
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
                @timetable="toggleTimetable"
                @archive="toggleArchive"
                @logout="logout"
            ></Sidebar>
            <Header
                    :is-desktop="isDesktop"
                    :title="currentTitle"
                    :show-back="showBack"
                    :allow-title-edit="isBoardShown"
                    @drawer="toggleDrawer"
                    @back="goBack"
                    @input="setBoardTitle"
            >
                <template v-slot:menu v-if="currentCard">
                    <v-menu bottom left offset-x @click.native.stop.prevent>
                        <template v-slot:activator="{ on }">
                            <v-btn icon text v-on="on" @click.stop><v-icon>mdi-dots-vertical</v-icon></v-btn>
                        </template>
                        <card-menu :card="currentCard"></card-menu>
                    </v-menu>
                </template>
                <template v-slot:menu v-else-if="isBoardShown">
                    <v-btn icon text @click="toggleFilterDrawer" v-if="!isDesktop && currentBoard.type !== 'kanban'" ><v-icon>mdi-filter</v-icon></v-btn>
                    <v-menu bottom left offset-x @click.native.stop.prevent>
                        <template v-slot:activator="{ on }">
                            <v-btn icon text v-on="on" @click.stop><v-icon>mdi-dots-vertical</v-icon></v-btn>
                        </template>
                        <board-menu
                                :board="currentBoard"
                                @toggleVacancy="toggleBoardVacancy(currentBoard)"
                        ></board-menu>
                    </v-menu>
                </template>
            </Header>
            <CardDetails v-if="currentCard" :card="currentCard" :statuses="statuses" :user="user" :skip-global="false" :is-desktop="isDesktop"></CardDetails>
            <CardArchive v-else-if="showArchive" :type="showArchive" :user="user" :boards="boards" :is-loading="archiveLoading" :cards="whitelistCards"></CardArchive>
            <Timetable v-else-if="showTimetable" :is-desktop="isDesktop" :user="user"></Timetable>
            <full-screen-editor v-else-if="showVacancyEditor" :text="currentBoard.vacancyText" @input="updateVacancyText"></full-screen-editor>
            <StatusBoard v-else-if="currentBoard.type === 'kanban'" :is-desktop="isDesktop" :statuses="statuses" :cards="cards" :key="'kanban'+currentBoard.type+currentBoardId"></StatusBoard>
            <AnalyticsBoard v-else
                    :is-desktop="isDesktop"
                    :statuses="statuses"
                    :cards="cards"
                    :key="'analytics'+currentBoard.type+currentBoardId"
                    :board="currentBoard"
                    :filter-drawer="showFilterDrawer"
            ></AnalyticsBoard>
        </v-container>
        <v-alert type="error" v-if="appError">{{appError}}</v-alert>
        <v-dialog v-model="shareDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline" v-if="shareCard">Ссылка на карточку</span>
                    <span class="headline" v-if="shareBoard">Ссылка на доску</span>
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
    import StatusBoard from './components/Board.vue';
    import AnalyticsBoard from "./components/AnalyticsBoard";
    import CardDetails from "./components/CardDetails";
    import Timetable from "./components/Timetable";
    import CardArchive from "./components/CardArchive";
    import Login from "./components/Login";
    import FullScreenEditor from "./components/FullScreenEditor";

    import CardMenu from "./components/Menus/CardMenu";
    import BoardMenu from "./components/Menus/BoardMenu";

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
        props: ['useGoogleServices'],
        components: {
            FullScreenEditor,
            AnalyticsBoard,
            StatusBoard,
            CardArchive,
            Header,
            Sidebar,
            CardDetails,
            Login,
            Timetable,
            CardMenu,
            BoardMenu
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
                showTimetable: false,
                showArchive: false,
                onlyCardMode: false,
                showFilterDrawer: false,
                showVacancyEditor: false,
                cardRedrawIndex: 0,
                teamMates: [],
                statuses: [],
                appError: null,
            }
        },
        watch: {
            currentBoardId: async function () {
                this.reloadBoardData();
            },
        },
        methods: {
            toggleDrawer() {
                this.drawer = !this.drawer;
            },
            toggleFilterDrawer() {
                this.showFilterDrawer = !this.showFilterDrawer;
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
            toggleTimetable() {
                this.currentCard = false;
                this.showArchive = false;
                this.showTimetable = !this.showTimetable;

                if (this.showTimetable) {
                    this.loadTimetableEvents();
                }
            },
            toggleArchive(type) {
                this.currentCard = false;
                this.showTimetable = false;
                this.showArchive = type;

                if (this.showArchive) {
                    this.loadArchiveCards(this.archiveType);
                }
            },
            async goBack() {
                if (this.currentCard) {
                    await this.saveCard(this.currentCard);
                    this.currentCard = false;
                }

                if (this.showVacancyEditor) {
                    await this.saveCurrentBoard();
                    this.showVacancyEditor = false;
                }

                this.updateUrl();

                if (this.showTimetable) {
                    this.loadTimetableEvents();
                }
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
            toggleBoardVacancy() {
                this.showVacancyEditor = !this.showVacancyEditor;
            }
        },
        computed: {
            currentTitle() {
                if (this.currentCard) {
                    return this.currentCardTitle;
                }

                if (this.showTimetable) {
                    return 'Расписание';
                }

                if (this.showArchive) {
                    let archiveTitles = {
                        whitelist: 'Резерв'
                    };

                    return archiveTitles[this.showArchive] || 'Архив';
                }

                if (this.showVacancyEditor) {
                    return this.currentBoard.title + ' - текст вакансии';
                }

                if (this.currentBoard) {
                    return this.currentBoard.title;
                }

                return false;
            },
            showBack() {
                return Boolean(this.currentCard) || this.showVacancyEditor;
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
</style>
