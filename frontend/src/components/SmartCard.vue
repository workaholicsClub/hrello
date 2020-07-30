<template>
    <v-container
            fluid
            class="card-details fill-height p-0"
            :class="{'is-desktop': !$vuetify.breakpoint.mobile, 'is-mobile': $vuetify.breakpoint.mobile}"
    >
        <v-main app fluid class="content">
            <v-container fluid class="fixed-header">
                <v-container class="header-fields overflow">
                    <v-text-field
                            v-model="card.name"
                            hide-details
                            dense
                            placeholder="ФИО кандидата"
                            class="mb-4 text-h4"
                            @input="$root.$emit('cardInput', card)"
                    ></v-text-field>

                    <v-row :key="fieldRedrawIndex">
                        <v-col cols="12" md="6" :key="field.id + fieldRedrawIndex" class="my-0 py-0" v-for="field in pinnedFields">
                            <pinned-field :field="field" :card="card" @state="updateRedrawIndex"></pinned-field>
                        </v-col>
                    </v-row>
                </v-container>
                <v-container class="header-fields">
                    <v-btn fab icon outlined absolute class="add-pinned-field" @click="addPinnedField"><v-icon large>mdi-plus</v-icon></v-btn>
                </v-container>
            </v-container>
            <div class="fixed-toc"></div>
            <v-container class="comments-list">
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
    import PinnedField from "./Fields/PinnedField";

    export default {
        name: "SmartCard",
        components: {
            SmartCommentView,
            SmartComment,
            PinnedField
        },
        data() {
            return {
                commentIndex: 0,
                newComment: {},
                commentMandatoryFields: {
                    type: 'comment',
                    fieldType: 'smartComment'
                },
                fieldRedrawIndex: 0
            }
        },
        mounted() {
            this.$nextTick(this.scrollToBottom);
        },
        methods: {
            updateRedrawIndex() {
                this.fieldRedrawIndex++;
            },
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
            },
            async addPinnedField() {
                await this.$store.dispatch('addPinnedField', {board: this.board, fieldName: '', fieldType: 'text'});
                this.$nextTick(this.updateRedrawIndex);
            }
        },
        computed: {
            pinnedFields() {
                return this.$store.getters.getPinnedFieldsWithValues(this.card, this.fieldRedrawIndex);
            },
            sortedFields() {
                return this.card.content ? this.card.content.slice().reverse() : [];
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

    .is-mobile .header-fields {
        top: 56px;
        max-height: 30vh;
    }

    .is-mobile .header-fields.overflow {
        overflow-y: auto;
    }

    .add-pinned-field {
        color: #16d1a5 !important;
        caret-color: #16d1a5 !important;
        background-color: white;
    }

    .content {
        position: relative;
    }

    .fixed-toc {
        position: fixed;
        left: 0;
        top: 0;
    }

    @media (min-width: 960px) {
        .header-fields, .comments-list {
            max-width: 900px!important;
        }
    }
    @media (min-width: 1264px) {
        .header-fields, .comments-list {
            max-width: 900px!important;
        }
    }
    @media (min-width: 1904px) {
        .header-fields, .comments-list {
            max-width: 1500px!important;
        }
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

    .v-input.text-h4 input {
        max-height: 48px;
    }
</style>