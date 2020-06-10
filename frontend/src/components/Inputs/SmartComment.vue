<template>
    <v-sheet class="p-0">
        <v-row class="comment-editor pt-4">
            <v-col>
                <v-row>
                    <v-col class="avatar-col">
                        <v-avatar size="36px">
                            <v-img v-if="user.imageUrl" :src="user.imageUrl"/>
                            <v-icon v-else>mdi-account-circle</v-icon>
                        </v-avatar>
                    </v-col>
                    <v-col>
                        <editor-content class="editor editor__content fill-height flex-fill" :editor="editor" />
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <v-btn color="success" large rounded>Отправить</v-btn>
            </v-col>
            <v-col cols="6">
                <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
                    <v-toolbar bottom flat>
                        <v-toolbar-items>
                            <v-tooltip class="mb-2" top>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon @click="showSuggestionsStandalone" v-on="on" :class="{ 'is-active': isActive.mention() }">
                                        <v-icon>mdi-at</v-icon>
                                    </v-btn>
                                </template>
                                <span>Упомянуть пользователя</span>
                            </v-tooltip>

                            <v-tooltip class="mb-2" top>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon v-on="on" :class="{ 'is-active': isActive.link() }">
                                        <v-icon>mdi-pound</v-icon>
                                    </v-btn>
                                </template>
                                <span>Добавить хэштэг</span>
                            </v-tooltip>

                            <v-tooltip class="mb-2" top>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon v-on="on">
                                        <v-icon>mdi-medal</v-icon>
                                    </v-btn>
                                </template>
                                <span>Выдать кандидату медаль</span>
                            </v-tooltip>

                            <v-divider vertical inset></v-divider>

                            <v-tooltip class="mb-2" top>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon v-on="on"><v-icon>mdi-calendar</v-icon></v-btn>
                                </template>
                                <span>Привязать дату</span>
                            </v-tooltip>

                            <v-tooltip class="mb-2" top>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon v-on="on" :class="{ 'is-active': isActive.link() }" @click="commands.link">
                                        <v-icon>mdi-link</v-icon>
                                    </v-btn>
                                </template>
                                <span>Указать ссылку</span>
                            </v-tooltip>

                            <v-tooltip class="mb-2" top>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon v-on="on" :class="{ 'is-active': isActive.todo_list() }" @click="commands.todo_list">
                                        <v-icon>mdi-checkbox-marked-outline</v-icon>
                                    </v-btn>
                                </template>
                                <span>Добавить галочку</span>
                            </v-tooltip>

                            <v-tooltip class="mb-2" top>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon v-on="on">
                                        <v-icon>mdi-paperclip</v-icon>
                                    </v-btn>
                                </template>
                                <span>Прикрепить файл</span>
                            </v-tooltip>

                            <v-divider vertical inset></v-divider>

                            <v-tooltip class="mb-2" top>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon v-on="on">
                                        <v-icon>mdi-thumb-up-outline</v-icon>
                                    </v-btn>
                                </template>
                                <span>Вставить оценку</span>
                            </v-tooltip>

                        </v-toolbar-items>
                    </v-toolbar>

                </editor-menu-bar>
            </v-col>
        </v-row>

        <editor-menu-bubble class="menu-bubble" :editor="editor" @hide="hideLinkMenu" v-slot="{ commands, isActive, getMarkAttrs, menu }">
            <div
                    class="menububble"
                    :class="{ 'is-active': menu.isActive }"
                    :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
            >

                <form class="menububble__form" v-if="linkMenuIsActive" @submit.prevent="setLinkUrl(commands.link, linkUrl)">
                    <input class="menububble__input" type="text" v-model="linkUrl" placeholder="https://" ref="linkInput" @keydown.esc="hideLinkMenu"/>
                    <button class="menububble__button" @click="setLinkUrl(commands.link, null)" type="button">
                        <icon name="remove" />
                    </button>
                </form>

                <template v-else>
                    <button
                            class="menububble__button"
                            @click="showLinkMenu(getMarkAttrs('link'))"
                            :class="{ 'is-active': isActive.link() }"
                    >
                        <span>{{ isActive.link() ? 'Update Link' : 'Add Link'}}</span>
                        <v-icon>mdi-link</v-icon>
                    </button>
                </template>

            </div>
        </editor-menu-bubble>
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
    import {Editor, EditorContent, EditorMenuBar, EditorMenuBubble} from 'tiptap';
    import {Mention, Placeholder, Heading, TodoItem, TodoList, Link} from 'tiptap-extensions';
    import TagList from "./TagList";
    import DateTimeNode from "./DateTimeNode";
    import tippy, { sticky } from 'tippy.js';

    export default {
        name: "SmartComment",
        props: ['value'],
        components: {
            EditorContent,
            EditorMenuBar,
            EditorMenuBubble
        },
        data() {
            let users = this.$store.state.teamMates;

            let mentionExtension = new Mention({
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
                });

            let hashtagExtension = new TagList({
                matcher: {
                    char: '#',
                    allowSpaces: true,
                    startOfLine: false
                },
                tagClass: 'hashtag',
                suggestionClass: 'hashtag-suggestion',

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
            });

            let editor = new Editor({
                content: this.value && this.value.text ? this.value.text : '',
                extensions: [
                    mentionExtension,
                    hashtagExtension,
                    new Placeholder({
                        emptyEditorClass: 'is-editor-empty',
                        emptyNodeClass: 'is-empty',
                        emptyNodeText: 'Оставить комментарий...',
                        showOnlyWhenEditable: true,
                        showOnlyCurrent: true,
                    }),
                    new Heading({ levels: [1] }),
                    new TodoItem(),
                    new TodoList(),
                    new DateTimeNode(),
                    new Link(),
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
                linkUrl: null,
                linkMenuIsActive: false,
            }
        },
        created() {
            this.taskData = this.editor.getJSON();
            this.htmlContent = this.editor.getHTML();
        },
        computed: {
            user() {
                return this.$store.state.user.currentUser;
            },
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
            showLinkMenu(attrs) {
                this.linkUrl = attrs.href
                this.linkMenuIsActive = true
                this.$nextTick(() => {
                    this.$refs.linkInput.focus();
                })
            },
            hideLinkMenu() {
                this.linkUrl = null
                this.linkMenuIsActive = false
            },
            setLinkUrl(command, url) {
                command({ href: url })
                this.hideLinkMenu()
            },
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

    .menu-bubble {
        position: absolute;
        display: flex;
        z-index: 20;
        background: #000;
        border-radius: 5px;
        padding: .3rem;
        margin-bottom: .5rem;
        transform: translateX(-50%);
        visibility: hidden;
        opacity: 0;
        transition: opacity .2s,visibility .2s;
    }

    .menububble.is-active {
        opacity: 1;
        visibility: visible;
    }

    .menububble__button:last-child {
        margin-right: 0;
    }

    .menububble__button {
        display: inline-flex;
        background: transparent;
        border: 0;
        color: #fff;
        padding: .2rem .5rem;
        margin-right: .2rem;
        border-radius: 3px;
        cursor: pointer;
    }

    .comment-editor {
        border-top: 1px solid rgba(0,0,0,.42);
    }

    .avatar-col {
        flex-grow: 0;
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
    .editor .mention-solo {
        cursor: text;
        margin: 0px;
    }
    .editor .date-time-container {
        background: #e0e0e0;
    }

    ul[data-type="todo_list"] {
        padding-left: 0;
    }
    li[data-type="todo_item"] {
        display: flex;
        flex-direction: row;
    }
    .todo-checkbox {
        border: 2px solid #000;
        height: 0.9em;
        width: 0.9em;
        box-sizing: border-box;
        margin-right: 10px;
        margin-top: 0.3rem;
        user-select: none;
        cursor: pointer;
        border-radius: 0.2em;
        background-color: transparent;
        transition: 0.4s background;
    }
    .todo-content {
        flex: 1;
    }
    .todo-content > p:last-of-type {
        margin-bottom: 0;
    }
    .todo-content > ul[data-type="todo_list"] {
        margin: .5rem 0;
    }

    li[data-done="true"] .todo-content > p {
        text-decoration: line-through;
    }
    li[data-done="true"] > .todo-checkbox {
        background-color: #000;
    }

    li[data-done="false"] {
        text-decoration: none;
    }
</style>