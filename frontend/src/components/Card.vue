<template>
    <v-card
            outlined elevation="2"
            min-width="300"
            @click="sendSelectCardEvent"
            :ripple="false"
            :class="{'overtime': this.isOvertime, 'severe-overtime': this.isSevereOvertime}"
    >
        <v-system-bar v-for="(color, index) in cardColor" :color="color" height="4" :key="index"></v-system-bar>
        <v-card-text>
            <v-list-item>
                <v-list-item-avatar color="primary" v-if="showAvatar" class="d-none d-sm-flex align-self-start">
                    <img :src="avatarUrl" v-if="avatarUrl">
                    <span class="white--text text-h6 headline" v-else>{{avatarAbbr}}</span>
                </v-list-item-avatar>
                <v-list-item-content>
                    <v-list-item-title class="text-h6 headline">
                        {{card.name || 'Новый кандидат'}}
                        <v-chip x-small v-if="showBoard" @click="gotoBoard">{{board.title}}</v-chip>
                    </v-list-item-title>
                    <div class="card-info" v-html="info" v-if="showInfo"></div>
                    <v-chip v-if="showStatus"
                            color="success"
                            label
                            outlined
                            small
                            style="max-width: 130px"
                            class="justify-content-center"
                    >{{statusName}}</v-chip>

                    <v-chip v-if="isOvertime || isSevereOvertime"
                            :color="isSevereOvertime ? 'red' : 'yellow'"
                            :dark="isSevereOvertime"
                            label
                            style="max-width: 200px"
                            class="justify-content-center"
                    >Просрочка: {{humanTimeOverdue}}</v-chip>

                    <div class="card-hashtags mt-4" v-if="showHashtags" @click.native.stop.prevent>
                        <tag-edit-view v-for="(hashtag, index) in hashtags" :key="hashtag.text+index"
                                :node="{attrs: hashtag}"
                                class="mr-1"
                                @click.native.stop.prevent="toggleTag('hashtag', hashtag)"
                        ></tag-edit-view>
                    </div>

                    <div class="card-achievement" v-if="showAchievements" :class="{'mt-4': !showHashtags, 'mt-1': showHashtags}" @click.native.stop.prevent>
                        <tag-edit-view v-for="(achievement, index) in achievements" :key="achievement.text+index"
                                :node="{attrs: achievement}"
                                class="mr-1"
                                @click.native.stop.prevent="toggleTag('achievement', achievement)"
                        ></tag-edit-view>
                    </div>

                    <div class="card-new-comment mt-4" v-if="displayComment" @click.native.stop.prevent>
                        <smart-comment-view
                                :field="displayComment"
                                :card="card"
                                :info-as-column="true"
                                :key="card && card.content ? card.content.length : ''"
                                @readonlyUpdate="updateComment"
                                @click.native.stop.prevent
                        ></smart-comment-view>
                    </div>

                    <div class="card-new-comment mt-4" v-if="showAddComment" @click.native.stop.prevent>
                        <smart-comment :value="newComment" @input="saveComment" :key="'newComment'+commentIndex" @click.native.stop.prevent></smart-comment>
                    </div>

                    <div class="card-icons mt-4 d-block flex-wrap" :class="{'d-md-flex': !small, 'single-menu': !showButtons}">
                        <div v-if="showButtons">
                            <v-btn outlined rounded color="success" @click.stop="showAddComment = true" class="mr-4">Оставить комментарий</v-btn>

                            <v-btn v-if="(almostFinished || !nextStatusTitle) && isActiveCard" text color="success" @click.stop="sendFinishedListEvent" class="pl-0">
                                <v-icon>mdi-check-bold</v-icon> В архив
                            </v-btn>
                            <v-btn v-if="!almostFinished && isActiveCard && nextStatusTitle" text color="success" @click.stop="sendMoveCardEvent" class="pl-0">
                                <v-icon>mdi-redo-variant</v-icon> {{nextStatusTitle}}
                            </v-btn>
                        </div>

                        <v-spacer></v-spacer>

                        <v-menu v-if="isArchiveCard" v-model="showArchiveMenu" bottom left offset-x @click.native.stop.prevent>
                            <template v-slot:activator="{ on }">
                                <v-btn icon text v-on="on" @click.stop><v-icon>mdi-archive-arrow-up-outline</v-icon></v-btn>
                            </template>
                            <v-list-item v-for="board in boards" :key="board.id" @click="sendMoveToBoardEvent(board)">
                                <v-list-item-title>{{board.title}}</v-list-item-title>
                            </v-list-item>
                        </v-menu>
                        <v-menu v-else v-model="showActiveMenu" bottom left offset-x @click.native.stop.prevent>
                            <template v-slot:activator="{ on }">
                                <v-btn icon text v-on="on" @click.stop><v-icon>mdi-dots-horizontal</v-icon></v-btn>
                            </template>
                            <card-menu :card="card"></card-menu>
                        </v-menu>

                    </div>

                    <slot name="footer"></slot>
                </v-list-item-content>
            </v-list-item>
        </v-card-text>
    </v-card>
</template>

<script>
    import moment from 'moment';
    import {getCardTags, getDefaultColors, getUniqueTags} from "../unsorted/Helpers";
    import CardMenu from "./Menus/CardMenu";
    import SmartComment from "./Inputs/SmartComment";
    import SmartCommentView from  "./Fields/View/SmartCommentView";
    import TagEditView from "./Inputs/TagEditView";

    let defaultColors = getDefaultColors();

    export default {
        name: 'Card',
        props: ['card', 'almostFinished', 'boards', 'statuses', 'commentIndex', 'small', 'showAvatar', 'showCommentOverride', 'showBoard'],
        components: {
            SmartComment,
            SmartCommentView,
            TagEditView,
            CardMenu
        },
        data() {
            let board = this.$store.getters.boardByCard( this.card );

            return {
                showActiveMenu: false,
                showArchiveMenu: false,
                showAddComment: false,

                showInfo: board.show ? board.show.info || false : false,
                showHashtags: board.show ? board.show.hashtags || false : false,
                showAchievements: board.show ? board.show.achievements || false : false,
                showStatus: board.show ? board.show.status || false : false,
                showButtons: board.show ? board.show.buttons || false : false,
                showLastComment: board.show ? board.show.lastComment || false : false,

                newComment: {},
                commentMandatoryFields: {
                    type: 'comment',
                    fieldType: 'smartComment'
                },
            }
        },
        watch: {
            board: {
                deep: true,
                handler() {
                    if (this.board.show) {
                        this.showInfo = this.board.show.info || false;
                        this.showHashtags = this.board.show.hashtags || false;
                        this.showAchievements = this.board.show.achievements || false;
                        this.showStatus = this.board.show.status || false;
                        this.showButtons = this.board.show.buttons || false;
                        this.showLastComment = this.board.show.lastComment || false;
                    }
                }
            }
        },
        methods: {
            gotoBoard() {
                this.$router.push({name: 'board', params: {boardId: this.board.id}});
            },
            sendMoveCardEvent() {
                this.$root.$emit('moveCardToNextStatus', this.card);
            },
            sendSelectCardEvent() {
                this.$root.$emit('selectCard', this.card.id);
            },
            sendFinishedListEvent() {
                this.$root.$emit('moveCardToFinishedList', this.card);
            },
            sendMoveToBoardEvent(board) {
                this.showMenu = false;
                this.showSubmenu = false;
                this.$root.$emit('moveCardToBoard', this.card, board);
            },
            saveComment(commentData) {
                let newComment = Object.assign(commentData, this.commentMandatoryFields);
                this.$root.$emit('newContentCard', newComment, this.card, this.board);
                this.newComment = {};
                this.commentIndex++;
                this.showAddComment = false;
            },
            toggleTag(type, tag) {
                this.$store.dispatch('toggleTagFilterValue', {board: this.board, filterName: type, toggledValue: tag});

                if (this.$route.name !== 'board') {
                    this.$router.push({name: 'board', params: {boardId: this.board.id}});
                }
            },
            updateComment(commentData) {
                this.$root.$emit('updateContent', commentData, this.displayComment, this.card);
            },
            overdueTime(fieldName) {
                return this.$store.getters.overTime(this.card, fieldName);
            },
        },
        computed: {
            displayComment() {
                if (!this.showLastComment && !this.showCommentOverride) {
                    return false;
                }

                let commentIndex = this.commentIndex || 0;

                if (typeof (commentIndex) !== 'number') {
                    return false;
                }

                if (!this.card.content) {
                    return false;
                }

                if (commentIndex < 0) {
                    commentIndex += this.card.content.length;
                }

                if (!this.card.content[ commentIndex ]) {
                    return false;
                }


                return this.card.content[ commentIndex ];
            },
            avatarUrl() {
                return this.$store.getters.getCandidateAvatarUrl(this.card);
            },
            avatarAbbr() {
                let nameParts = this.card.name ? this.card.name.split(/\s/) : ['Неизвестный', 'кандидат'];
                let letters = nameParts.map( part => part.toLocaleUpperCase()[0] ).splice(0,2).join('');
                return letters;
            },
            info() {
                let fields = this.$store.getters.getPinnedFieldsWithValues(this.card);
                let positionField = fields.find(field => {
                    let name = field.name ? field.name.toLocaleLowerCase() : '';
                    return name.indexOf('позиц') !== -1 || name.indexOf('должн') !== -1;
                });
                let visibleFields = fields.slice(); //fields.filter( field => field.showOnCard === true );
                if (positionField) {
                    let positionIndex = fields.indexOf(positionField);
                    visibleFields.splice(positionIndex, 1);
                    visibleFields.unshift(positionField);
                }

                let infoParts = visibleFields.filter(field => Boolean(field.value)).map( field => {
                    let value = field.value;
                    if (field.value.toString().match(/https*:\/\//i)) {
                        let url = new URL(field.value);
                        let hostname = url.hostname;
                        value = `<a class="info-link" href="${field.value}">${hostname}</a>`;
                    }

                    let needTitle = false;

                    if (needTitle) {
                        return `${field.name}: ${value}`;
                    }
                    else {
                        return value;
                    }
                });

                return infoParts.join('&nbsp;&bull; ');
            },
            hashtags() {
                return getUniqueTags( getCardTags(this.card, 'hashtag') );
            },
            achievements() {
                return getUniqueTags( getCardTags(this.card, 'achievement') );
            },
            isArchiveCard() {
                return this.card.blacklist || this.card.whitelist || this.card.finishedlist || this.card.deleted || this.card.archive;
            },
            isActiveCard() {
                return !this.isArchiveCard;
            },
            cardColor() {
                let firstColorField = this.card.content
                    ? this.card.content.find(valueItem => valueItem.type === 'field' && valueItem.fieldType === 'color')
                    : false;

                if (!firstColorField) {
                    return null;
                }

                let colors = firstColorField.colors || defaultColors;

                let currentColors = colors
                                        .filter( colorItem => firstColorField.value && firstColorField.value.indexOf(colorItem.value) !== -1 )
                                        .map( colorItem => colorItem.color );
                return currentColors ? currentColors : null;
            },
            pendingEvent() {
                let cardHasContent = this.card.content && this.card.content instanceof Array;
                let cardHasGlobalFields = this.card.globalValues && this.card.globalValues instanceof Array;

                let fields = cardHasGlobalFields ? this.card.globalValues : [];
                if (cardHasContent) {
                    fields = fields.concat(this.card.content);
                }

                return fields.reduce( (foundEvent, content) => {
                            if (foundEvent === false) {

                                let isEvent = content.type === 'event';
                                let isNotOutdated = isEvent && (new Date(content.value) > Date.now());

                                if (isNotOutdated) {
                                    foundEvent = content;
                                }
                            }

                            return foundEvent;
                        }, false);
            },
            pendingEventText() {
                if (this.pendingEvent) {
                    let formattedDate = moment(this.pendingEvent.value).format('D MMM в HH:mm');
                    return this.pendingEvent.name + ', ' + formattedDate;
                }
                else {
                    return 'Предстоящих событий нет';
                }
            },
            board() {
                return this.$store.getters.boardByCard( this.card );
            },
            status() {
                let statuses = this.board.statuses || [];
                let status = statuses.find( status => status.id === this.card.statusId );

                if (status) {
                    return status;
                }

                return false;
            },
            nextStatusTitle() {
                let nextStatus = this.$store.getters.nextCardStatus(this.card);
                return nextStatus ? "На " + nextStatus.title.toLocaleLowerCase() : false;
            },
            statusName() {
                let status = this.status;

                if (status) {
                    return status.title;
                }

                return '';
            },
            timeInCurrentStatus() {
                return this.$store.getters.timeInCurrentStatus(this.card);
            },
            humanTimeOverdue() {
                return moment.duration(this.overdueTime('overTime'), 'seconds').humanize();
            },
            boardHasTimeStats() {
                return this.board.stats && this.board.stats.time;
            },
            isOvertime() {
                return this.overdueTime('overTime') && !this.isSevereOvertime;
            },
            isSevereOvertime() {
                return Boolean( this.overdueTime('severeOverTime') );
            }
        }
    }
</script>

<style scoped>
    .v-card {
        margin-bottom: 8px;
        cursor: pointer;
        min-width: 375px;
        position: relative;
    }

    .v-card .card-icons.single-menu {
        position: absolute;
        bottom: 0;
        right: 0;
    }

    .v-card .elevation-2 {
        box-shadow: 0 3px 7px -2px rgba(0, 0, 0, 0.2) !important;
    }

    .v-card .v-card-text {
        padding: 34px;
    }

    .v-card p, .v-card h1, .v-card h2, .v-card h3, .v-card h4, .v-card h5, .v-card h6 {
        margin-bottom: 0;
    }

    .v-card h6 {
        font-size: 16px;
        margin-bottom: 2px;
    }

    .v-card .row {
        margin-left: 0;
        margin-right: 0;
    }

    .v-chip.badge {
        position: absolute;
        right: 0;
        margin-right: -12px;
        margin-top: -24px;
        padding: 2px;

        width: 22px;
        height: 22px;
        font-size: 14px;
    }

    .v-chip.badge .v-icon {
        font-size: 18px;
    }

    .v-card .card-info {
        line-height: 20px;
        color: #675a79;
    }

    .v-btn--icon.v-size--default {
        width: 24px!important;
        height: 24px!important;
        margin-left: 8px;

        color: #6ca4b3;
        font-size: 14px;
    }

    .v-menu__content {
        background-color: #ffffff;
    }
</style>

<style>

    .card-icon .v-btn {
        text-transform: none;
    }

    .hashtag {
        color: var(--v-anchor-base);
        text-shadow: none!important;
    }

    .v-avatar {
        border: 1px solid #aaa;
    }
</style>