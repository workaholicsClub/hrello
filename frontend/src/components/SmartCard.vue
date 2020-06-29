<template>
    <v-container fluid class="card-details fill-height p-0" :class="{'is-desktop': isDesktop, 'is-mobile': !isDesktop}">
        <v-main app fluid class="content">
            <v-container fluid class="fixed-header">
                <v-container class="header-fields">
                    <v-text-field
                            v-model="card.name"
                            label="ФИО кандидата"
                            @input="$root.$emit('cardInput', card)"
                    ></v-text-field>
                </v-container>
            </v-container>
            <div class="fixed-toc"></div>
            <v-container>
                <smart-comment-view v-for="(field, index) in sortedFields"
                        :field="field"
                        :key="index+(field.id || field.name || field.title)"
                        @readonlyUpdate="(updatedField) => updateComment(updatedField, field)"
                ></smart-comment-view>
            </v-container>
        </v-main>
        <v-footer app inset color="white" class="fixed-footer">
            <v-container>
                <smart-comment :value="newComment" @input="saveComment" :key="'newComment'+commentIndex"></smart-comment>
            </v-container>
        </v-footer>
    </v-container>
</template>

<script>
    import SmartComment from "./Inputs/SmartComment";
    import SmartCommentView from "./Fields/View/SmartCommentView";

    export default {
        name: "SmartCard",
        components: {
            SmartCommentView,
            SmartComment
        },
        data() {
            return {
                commentIndex: 0,
                newComment: {},
                commentMandatoryFields: {
                    type: 'comment',
                    fieldType: 'smartComment'
                },
            }
        },
        mounted() {
            this.$nextTick(this.scrollToBottom);
        },
        methods: {
            saveComment(commentData) {
                let newComment = Object.assign(commentData, this.commentMandatoryFields);
                this.$root.$emit('newContentCard', newComment, this.card, this.board);
                this.newComment = {};
                this.commentIndex++;
                this.$nextTick(this.scrollToBottom);
            },
            updateComment(commentData, oldField) {
                this.$root.$emit('updateContent', commentData, oldField, this.card);
            },
            scrollToBottom() {
                window.scrollTo(0,document.body.scrollHeight);
            }
        },
        computed: {
            sortedFields() {
                return this.card.content.slice().reverse();
            },
            card() {
                return this.$store.state.card.currentCard;
            },
            user() {
                return this.$store.state.user.currentUser;
            },
            board() {
                return this.$store.getters.boardByCard( this.card );
            },
            isDesktop() {
                return this.$isDesktop();
            },
        }
    }
</script>

<style scoped>
    .card-details {
        background: #fff;
        position: relative;
        align-items: start;
    }

    .content-list .v-card {
        width: 100%;
    }

    .v-list-item__content {
        overflow: visible;
    }

    .v-toolbar {
        left: 50%;
        margin-left: -150px;
        position: fixed;
    }

    .fixed-header {
        border-top: 6px solid #16d1a5;
        border-bottom: 2px solid rgba(0,0,0,.1);
        position: sticky;
        top: 64px;
        background: #fff;
        z-index: 10;
    }

    .is-mobile .fixed-header {
        top: 56px;
    }

    /*.fixed-footer {*/
    /*    position: fixed;*/
    /*    bottom: 0;*/
    /*}*/

    .content {
        position: relative;
    }

    .fixed-toc {
        position: fixed;
        left: 0;
        top: 0;
    }
</style>

<style>
      .v-file-input legend {
          display: none;
      }


    .card-toolbar .v-toolbar__content {
        width: 300px;
        justify-content: space-around;
    }

    .v-tooltip__content {
        margin-bottom: .5rem!important;
        margin-top: -0.5rem!important;
    }
</style>