<template>
    <v-sheet class="p-0 d-flex flex-row">
        <editor-content class="editor editor__content fill-height flex-fill" :editor="editor" />

        <editor-menu-bar :editor="editor" v-slot="{ commands }">
            <div>
                <v-btn icon><v-icon>mdi-calendar</v-icon></v-btn>
                <v-btn icon @click="showSuggestionsStandalone"><v-icon>mdi-account-plus</v-icon></v-btn>
            </div>
        </editor-menu-bar>

        <div v-show="showSuggestions" ref="suggestions">
            <v-card tile>
                <v-list>
                    <v-list-item-group v-model="navigatedUserIndex" color="primary">
                        <template v-if="hasResults">
                            <v-list-item
                                    v-for="(user, index) in filteredUsers"
                                    :key="index"
                                    class="suggestion-list__item"
                                    @click="selectUser(user)"
                            >
                                <v-list-item-content>
                                    <v-list-item-title>{{ user.fullName }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                    </v-list-item-group>
                </v-list>
            </v-card>
        </div>
    </v-sheet>
</template>

<script>
    import {Editor, EditorContent, EditorMenuBar} from 'tiptap';
    import {Mention, Placeholder} from 'tiptap-extensions';
    import DateTimeNode from "./DateTimeNode";
    import tippy, { sticky } from 'tippy.js';

    export default {
        name: "TaskEdit",
        props: ['value'],
        components: {
            EditorContent,
            EditorMenuBar,
        },
        data() {
            let users = this.$store.state.teamMates;

            let editor = new Editor({
                content: this.value && this.value.text ? this.value.text : '',
                extensions: [
                    new Mention({
                        mentionClass: 'mention-solo',
                        items: () => users,
                        onEnter: ({items, query, range, command, virtualNode}) => {
                            this.query = query;
                            this.filteredUsers = items;
                            this.suggestionRange = range;
                            this.renderPopup(virtualNode);
                            this.insertMention = command;
                        },
                        onChange: ({items, query, range, virtualNode}) => {
                            this.query = query;
                            this.filteredUsers = items;
                            this.suggestionRange = range;
                            this.navigatedUserIndex = 0;
                            this.renderPopup(virtualNode);
                        },
                        onExit: () => {
                            this.query = null;
                            this.filteredUsers = [];
                            this.suggestionRange = null;
                            this.navigatedUserIndex = 0;
                            this.destroyPopup();
                        },
                        onKeyDown: ({ event }) => {
                            if (event.key === 'ArrowUp') {
                                this.upHandler();
                                return true;
                            }
                            if (event.key === 'ArrowDown') {
                                this.downHandler();
                                return true;
                            }
                            if (event.key === 'Enter') {
                                this.enterHandler();
                                return true;
                            }
                            return false;
                        },
                    }),
                    new Placeholder({
                        emptyEditorClass: 'is-editor-empty',
                        emptyNodeClass: 'is-empty',
                        emptyNodeText: 'Опишите задачу, добавьте @участников, укажите сроки',
                        showOnlyWhenEditable: true,
                        showOnlyCurrent: true,
                    }),
                    new DateTimeNode(),
                ],
                onUpdate: this.textChanged,
            });

            return {
                taskData: false,
                htmlContent: '',
                query: null,
                suggestionRange: null,
                filteredUsers: [],
                allUsers: users,
                showStandalone: false,
                navigatedUserIndex: 0,
                insertMention: (data) => editor.commands.mention(data.attrs),
                editor: editor,
            }
        },
        created() {
            this.taskData = this.editor.getJSON();
            this.htmlContent = this.editor.getHTML();
        },
        computed: {
            hasResults() {
                return this.filteredUsers.length;
            },
            showSuggestions() {
                return this.query || this.hasResults || this.showStandalone;
            },
            editorSelectionRange() {
                return this.editor.selection;
            },
            dates() {
                let hasContent = this.taskData && this.taskData.content;
                if (!hasContent) {
                    return [];
                }

                let datetimeNodes = this.getNodesFromTextTree(this.taskData.content, 'datetime');
                let datesOnly = datetimeNodes.map( node => node.attrs.value );

                return datesOnly;
            },
            users() {
                let hasContent = this.taskData && this.taskData.content;
                if (!hasContent) {
                    return [];
                }

                let userNodes = this.getNodesFromTextTree(this.taskData.content, 'mention');
                let userIds = userNodes.map( node => node.attrs.id );
                let usersInText = this.allUsers.filter( enumUser => userIds.indexOf(enumUser.id) !== -1 );

                return usersInText;
            }
        },
        methods: {
            upHandler() {
                this.navigatedUserIndex = ((this.navigatedUserIndex + this.filteredUsers.length) - 1) % this.filteredUsers.length;
            },
            downHandler() {
                this.navigatedUserIndex = (this.navigatedUserIndex + 1) % this.filteredUsers.length;
            },
            enterHandler() {
                const user = this.filteredUsers[this.navigatedUserIndex];
                if (user) {
                    this.selectUser(user);
                }
            },
            selectUser(user) {
                this.insertMention({
                    range: this.suggestionRange || this.editorSelectionRange,
                    attrs: {
                        id: user.id,
                        label: user.fullName,
                    },
                })
                this.editor.focus()
            },
            renderPopup(node) {
                if (this.popup) {
                    return;
                }

                this.popup = tippy('.v-application', {
                    getReferenceClientRect: node.getBoundingClientRect,
                    appendTo: () => document.body,
                    interactive: true,
                    sticky: true, // make sure position of tippy is updated when content changes
                    plugins: [sticky],
                    content: this.$refs.suggestions,
                    trigger: 'mouseenter', // manual
                    showOnCreate: true,
                    placement: 'top-start',
                    inertia: true,
                    duration: [400, 200],
                })
            },
            destroyPopup() {
                if (this.popup) {
                    this.popup[0].destroy()
                    this.popup = null
                    this.showStandalone = false;
                }
            },
            showSuggestionsStandalone(event) {
                let realNode = event.target;
                let virtualNode = realNode ? {
                    getBoundingClientRect: () => realNode.getBoundingClientRect(),
                    clientWidth: realNode.clientWidth,
                    clientHeight: realNode.clientHeight
                } : null;

                this.showStandalone = true;
                this.filteredUsers = this.allUsers;
                this.renderPopup(virtualNode);
            },
            textChanged({getJSON, getHTML}) {
                this.taskData = getJSON();
                this.htmlContent = getHTML();

                this.commitChanges();
            },
            getNodesFromTextTree(tree, searchType) {
                return tree.reduce( (foundNodes, node) => {
                    let hasSubtree = typeof(node.content) !== 'undefined';

                    if (hasSubtree) {
                        let subNodes = this.getNodesFromTextTree(node.content, searchType);
                        foundNodes = foundNodes.concat(subNodes);
                    }

                    if (node.type === searchType) {
                        foundNodes.push(node);
                    }

                    return foundNodes;
                }, []);
            },
            commitChanges() {
                let taskData = {
                    text: this.htmlContent,
                    dates: this.dates,
                    users: this.users
                }

                this.$emit('input', taskData);
            }
        },
        beforeDestroy() {
            this.destroyPopup();
            this.editor.destroy();
        },
    }
</script>

<style scoped>
    .editor__content {
        background: white;
        cursor: text;
    }
</style>

<style>
    .editor p.is-editor-empty:first-child::before {
        content: attr(data-empty-text);
        float: left;
        color: #aaa;
        pointer-events: none;
        height: 0;
        font-style: italic;
    }

    .editor .mention {
        align-items: center;
        cursor: default;
        display: inline-flex;
        line-height: 20px;
        max-width: 100%;
        outline: none;
        overflow: hidden;
        padding: 0 12px;
        position: relative;
        text-decoration: none;
        transition-duration: .28s;
        transition-property: box-shadow, opacity;
        transition-timing-function: cubic-bezier(.4, 0, .2, 1);
        vertical-align: middle;
        white-space: nowrap;

        border-color: rgba(0,0,0,.12);
        color: rgba(0,0,0,.87);

        border-radius: 16px;
        font-size: 14px;
        height: 32px;

        background: #e0e0e0;

        margin-top: 8px;
    }

    .editor .mention-solo {
        box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
        padding: 0 12px;
        background: #FFFFFF;
        margin-bottom: 4px;
        cursor: text;
        transition: background 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
        align-items: center;
        display: inline-block;
        position: relative;
        min-height: 38px;
        border-radius: 4px;
        align-content: center;
        line-height: 38px;
    }

    .editor .date-time-container {
        background: #e0e0e0;

    }
</style>