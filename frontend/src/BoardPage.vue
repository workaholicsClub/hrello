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
                <v-btn x-large dark @click="login">Вход с помощью Google</v-btn>
            </v-row>
        </v-container>
        <v-container fill-height fluid v-else-if="hasNoBoards">
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
        <div v-else>
            <Sidebar
                :drawer="drawer"
                :is-desktop="isDesktop"
                :boards="boards"
                :user="user"
                :active-item="currentBoard ? 'board'+currentBoard.id : false"
                @drawer="setDrawerState"
                @changeBoard="changeBoard"
                @timetable="toggleTimetable"
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
            ></Header>
            <CardDetails v-if="currentCard" :card="currentCard" :global-fields="globalFields" :global-events="globalEvents" :key="cardRedrawIndex" class="mt-2"></CardDetails>
            <Timetable v-else-if="showTimetable" :is-desktop="isDesktop" :grouped-events="timetableEvents"></Timetable>
            <Board v-else :is-desktop="isDesktop" :statuses="statuses" :cards="cards" :global-fields="globalFields" class="mt-2"></Board>
        </div>
    </v-app>

</template>

<script>
    import Header from './components/Header.vue'
    import Sidebar from './components/Sidebar.vue'
    import Board from './components/Board.vue'
    import CardDetails from "./components/CardDetails";
    import Timetable from "./components/Timetable";

    import CardsMixin from "./mixins/cards";
    import BoardsMixin from "./mixins/boards";
    import StatusMixin from "./mixins/statuses";
    import EventsMixin from "./mixins/events";
    import FieldsMixin from "./mixins/fields";
    import UserMixin from "./mixins/user";

    import axios from 'axios';
    import moment from 'moment';

    export default {
        name: 'BoardPage',
        components: {
            Header,
            Sidebar,
            Board,
            CardDetails,
            Timetable
        },
        mixins: [
            CardsMixin,
            BoardsMixin,
            StatusMixin,
            EventsMixin,
            FieldsMixin,
            UserMixin
        ],
        data() {
            return {
                drawer: this.$isDesktop(),
                mini: this.$isDesktop(),
                isDesktop: this.$isDesktop(),
                initFinished: false,
                showTimetable: false,
                cardRedrawIndex: 0,
                statuses: [],
            }
        },
        watch: {
            currentBoardId: async function () {
                this.reloadBoardData();
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
            changeUrlAndAvoidResetByVue(newHash) {
                setTimeout(() => {
                    window.location.hash = newHash;
                }, 0);
            },
            updateUrl() {
                let urlHashParts = [this.currentBoardId ? this.currentBoardId : '' ];
                if (this.currentCardId) {
                    urlHashParts.push(this.currentCardId);
                }

                let newHash = '!/' + urlHashParts.join('/');
                this.changeUrlAndAvoidResetByVue(newHash);
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
            async loadBoardStatuses() {
                let statusesResponse = await axios.get('/api/status/list', {
                    params: {
                        boardId: this.currentBoardId
                    }
                });

                this.statuses = statusesResponse.data.status;
            },

            toggleTimetable() {
                this.currentCard = false;
                this.showTimetable = !this.showTimetable;

                if (this.showTimetable) {
                    this.loadTimetableEvents();
                }
            },
            goBack() {
                this.currentCard = false;
                this.updateUrl();
            },
        },
        computed: {
            currentTitle() {
                if (this.currentCard) {
                    return this.currentCard.name;
                }

                if (this.showTimetable) {
                    return 'Расписание';
                }

                if (this.currentBoard) {
                    return this.currentBoard.title;
                }

                return false;
            },
            showBack() {
                return Boolean(this.currentCard);
            },
        },
        async created() {
            moment.locale('ru');

            let isUserSignedIn = await this.checkAndLoadAuthorizedUser();

            if (isUserSignedIn) {
                await this.getGoogleToken();
                await this.loadBoards();
                await this.loadUrlData();
            }

            this.initFinished = true;
        },
        mounted() {
        },
        beforeDestroy() {
        }
    }
</script>

<style>
    #hrello {
        background-color: #e7f2f5;
    }
</style>
