<template>
    <v-container fluid class="card-details fill-height p-0">
        <v-content app fluid class="content">
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
                <smart-comment-view v-for="(field, index) in card.content" :field="field" :key="index+(field.id || field.name || field.title)"></smart-comment-view>
            </v-container>
        </v-content>
        <v-footer app inset color="white" class="fixed-footer">
            <v-container>
                <smart-comment v-model="newField"></smart-comment>
            </v-container>
        </v-footer>
    </v-container>
</template>

<script>
    import {getFieldTypes} from "../unsorted/Helpers";
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
                newField: {
                    type: 'comment',
                    fieldType: 'smartComment'
                },
            }
        },
        methods: {
            addNewContent() {

            },
            addNewField() {

            }
        },
        computed: {
            fieldTypes() {
                return getFieldTypes();
            },
            card() {
                return this.$store.state.card.currentCard;
            },
            user() {
                return this.$store.state.user.currentUser;
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