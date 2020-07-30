<template>
    <div class="comment-container">
        <div class="p-0 hide-cursor-when-editing-on" v-if="readOnly" @click="readOnlyClicked">
            <editor-content class="editor editor__content fill-height flex-fill" :editor="editor"/>
        </div>
        <v-sheet class="p-0" v-else>
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
            <div class="d-flex flex-wrap comment-controls flex-column flex-md-row-reverse align-items-start">
                <div>
                    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
                        <v-toolbar bottom flat>
                            <v-toolbar-items>
                                <v-tooltip class="mb-2" top>
                                    <template v-slot:activator="{ on }">
                                        <v-btn icon @click="(event) => showStandalone('mention', event)" v-on="on" :class="{ 'is-active': isActive.mention() }">
                                            <v-icon>mdi-at</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Упомянуть пользователя</span>
                                </v-tooltip>

                                <v-tooltip class="mb-2" top>
                                    <template v-slot:activator="{ on }">
                                        <v-btn icon @click="(event) => showStandalone('hashtag', event)" v-on="on" :class="{ 'is-active': isActive.hashtag() }">
                                            <v-icon>mdi-pound</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Добавить хэштэг</span>
                                </v-tooltip>

                                <v-tooltip class="mb-2" top>
                                    <template v-slot:activator="{ on }">
                                        <v-btn icon @click="(event) => showStandalone('achievement', event)" v-on="on" :class="{ 'is-active': isActive.achievement() }">
                                            <v-icon>mdi-medal</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Выдать кандидату медаль</span>
                                </v-tooltip>

                                <v-divider vertical inset></v-divider>

                                <v-tooltip class="mb-2" top>
                                    <template v-slot:activator="{ on }">
                                        <v-btn icon v-on="on" :class="{ 'is-active': isActive.datetime() }" @click="insertNewDateTime"><v-icon>mdi-calendar</v-icon></v-btn>
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
                                        <v-btn icon v-on="on" :class="{ 'is-active': isActive.file() }" @click="selectFile">
                                            <v-icon>mdi-paperclip</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Прикрепить файл</span>

                                    <form style="display: none">
                                        <input type="file" ref="fileInput" @change="fileSelected">
                                    </form>

                                </v-tooltip>

                                <v-divider vertical inset></v-divider>

                                <v-tooltip class="mb-2" top>
                                    <template v-slot:activator="{ on }">
                                        <v-btn icon v-on="on" :class="{ 'is-active': isActive.like() }" @click="commands.like">
                                            <v-icon>mdi-thumb-up-outline</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Вставить оценку</span>
                                </v-tooltip>

                            </v-toolbar-items>
                        </v-toolbar>

                    </editor-menu-bar>
                </div>
                <div class="flex-fill pb-1">
                    <v-btn color="success"
                            large
                            rounded
                            v-shortkey="['ctrl', 'enter']"
                            class="send-button"
                            @click="commitChanges"
                            @shortkey="commitChangesIfFocused"
                    ><span>Отправить</span><small>(Ctrl+Enter)</small></v-btn>
                </div>
            </div>

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

                    <!--template v-else>
                        <button
                                class="menububble__button"
                                @click="showLinkMenu(getMarkAttrs('link'))"
                                :class="{ 'is-active': isActive.link() }"
                        >
                            <span>{{ isActive.link() ? 'Изменить ссылку' : 'Добавить ссылку'}}</span>
                            <v-icon>mdi-link</v-icon>
                        </button>
                    </template-->

                </div>
            </editor-menu-bubble>

            <div v-for="listCode in lists" :ref="listCode" :key="listCode">
                <suggestion-list
                        :items="filteredItems[listCode]"
                        :list-code="listCode"
                        :navigated-index="navigatedIndex[listCode]"
                        :visible="isPopupVisible(listCode)"
                        :can-add="hasAddItem(listCode)"
                        @select="selectItem"
                        @add="insertNewItem"
                ></suggestion-list>
            </div>
        </v-sheet>
    </div>
</template>

<script>
    import {Editor, EditorContent, EditorMenuBar, EditorMenuBubble} from 'tiptap';
    import {Placeholder, Heading, TodoItem, TodoList} from 'tiptap-extensions';
    import TagListNode from "./TagListNode";
    import DateTimeNode from "./DateTimeNode";
    import FileNode from "./FileNode";
    import LikeNode from "./LikeNode";
    import LinkNode from "./LinkNode";
    import SuggestionList from "./SuggestionList";
    import tippy, { sticky } from 'tippy.js';
    import Fuse from 'fuse.js';
    import moment from "moment";
    import shortid from "shortid";
    import axios from "axios";
    import {getUniqueTags} from '../../unsorted/Helpers';

    export default {
        name: "SmartComment",
        props: ['value', 'readOnly', 'card'],
        components: {
            EditorContent,
            EditorMenuBar,
            EditorMenuBubble,
            SuggestionList
        },
        data() {
            let users = this.$store.state.teamMates;
            let hashtags = this.$store.getters.getAllTags('hashtag');
            let achievements = this.$store.getters.getAllTags('achievement');

            let defaultAchievements = [
                {icon: 'mdi-forum-outline', color: 'rgba(255, 0, 0, 0.5)', text: 'За отличное собеседование'},
                {icon: 'mdi-cash', color: 'rgba(0, 255, 0, 0.5)', text: 'За скромные требования'},
                {icon: 'mdi-bee', color: 'rgba(0, 0, 255, 0.5)', text: 'За активную заинтересованность'},
            ];

            achievements = getUniqueTags( achievements.concat( defaultAchievements ) );

            let allItems = {
                mention: users.map( user => { return {text: user.fullName} } ),
                hashtag: hashtags.map( hashtag => { return {text: hashtag.text} } ),
                achievement: achievements,
            };

            let mentionExtension = new TagListNode({
                name: 'mention',
                tagClass: 'mention',
                suggestionClass: 'mention-suggestion',
                items: () => allItems.mention.slice(),
                onFilter: this.makeOnFilter('mention'),
                onEnter: this.makeOnListEnter('mention'),
                onChange: this.makeOnListChange('mention'),
                onExit: this.makeOnExit('mention'),
                onKeyDown: this.makeOnKeyDown('mention')
            });

            let hashtagExtension = new TagListNode({
                name: 'hashtag',
                matcher: {
                    char: '#',
                    allowSpaces: true,
                    startOfLine: false
                },
                tagClass: 'hashtag',
                suggestionClass: 'hashtag-suggestion',

                items: () => allItems.hashtag.slice(),
                onFilter: this.makeOnFilter('hashtag'),
                onEnter: this.makeOnListEnter('hashtag'),
                onChange: this.makeOnListChange('hashtag'),
                onExit: this.makeOnExit('hashtag'),
                onKeyDown: this.makeOnKeyDown('hashtag')
            });

            let achievementExtension = new TagListNode({
                name: 'achievement',
                matcher: {
                    char: '$',
                    allowSpaces: true,
                    startOfLine: false
                },
                tagClass: 'achievement',
                suggestionClass: 'achievement-suggestion',

                items: () => allItems.achievement.slice(),
                onFilter: this.makeOnFilter('achievement'),
                onEnter: this.makeOnListEnter('achievement'),
                onChange: this.makeOnListChange('achievement'),
                onExit: this.makeOnExit('achievement'),
                onKeyDown: this.makeOnKeyDown('achievement')
            });

            let editor = new Editor({
                content: this.value && this.value.text ? this.value.text : '',
                editable: !this.readOnly,
                extensions: [
                    mentionExtension,
                    hashtagExtension,
                    achievementExtension,
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
                    new LinkNode(),
                    new FileNode(),
                    new LikeNode(),
                ],
                onUpdate: this.textChanged,
                onTransaction: this.resolveReadonlyClick,
            });

            return {
                lists: Object.keys(allItems),

                commentData: false,
                htmlContent: '',
                allUsers: users,

                insertNodes: {
                    mention: (data) => editor.commands.mention(data.attrs),
                    hashtag: (data) => editor.commands.hashtag(data.attrs),
                    achievement: (data) => editor.commands.achievement(data.attrs)
                },
                queries: {},
                filteredItems: allItems,
                allItems: allItems,
                insertRange: {},
                navigatedIndex: {
                    mention: 0,
                    hashtag: 0,
                    achievement: 0
                },
                popup: {},

                filesToUpload: [],

                editor: editor,
                linkUrl: null,
                linkMenuIsActive: false,

                isUploadingFiles: false,
                readonlyClickProcessedResolve: false,
            }
        },
        created() {
            this.commentData = this.editor.getJSON();
            this.htmlContent = this.editor.getHTML();
        },
        computed: {
            user() {
                return this.$store.state.user.currentUser;
            },
            editorSelectionRange() {
                return this.editor.selection;
            },
            dates() {
                let datetimeNodes = this.getNodesFromComment('datetime');
                let datesOnly = datetimeNodes.map( node => node.attrs.value );

                return datesOnly;
            },
            users() {
                let userNodes = this.getNodesFromComment('mention');
                let userNames = userNodes.map( node => node.attrs.text );
                let usersInText = this.allUsers.filter( enumUser => userNames.indexOf(enumUser.fullName) !== -1 );

                return usersInText;
            },
            files() {
                let fileNodes = this.getNodesFromComment('file');
                let fileAttrs = fileNodes.map( node => node.attrs );

                return fileAttrs;
            },
            likes() {
                let likeNodes = this.getNodesFromComment('like');
                let likeAttrs = likeNodes.map( node => node.attrs );

                return likeAttrs;
            },
            todos() {
                let listNodes = this.getNodesFromComment('todo_list');

                let lists = listNodes.map( node => {
                    let listItems = node.content.map( itemNode => {

                        return {
                            done: itemNode.attrs.done,
                            text: this.getNodeText(itemNode)
                        };
                    });

                    return listItems;
                });

                return lists;
            },
            links() {
                let linkNodes = this.getMarkedNodesFromComment('link');
                let links = linkNodes.map( node => {
                    let mark = node.marks.find( mark => mark.type === 'link' );

                    return {
                        text: this.getNodeText(node),
                        href: mark.attrs.href,
                    }
                });

                return links;
            },
            isReadonlyClickProcessed() {
                return this.readonlyClickProcessedResolve !== false;
            }
        },
        methods: {
            makeOnListEnter(listCode) {
                return ({items, query, range, command, virtualNode}) => {
                    this.$set(this.queries, listCode, query);
                    this.$set(this.filteredItems, listCode, items);
                    this.$set(this.insertRange, listCode, range);
                    this.$set(this.insertNodes, listCode, command);

                    this.renderPopup(virtualNode, listCode);
                }
            },
            makeOnListChange(listCode) {
                return ({items, query, range, virtualNode}) => {
                    this.$set(this.queries, listCode, query);
                    this.$set(this.filteredItems, listCode, items);
                    this.$set(this.insertRange, listCode, range);
                    this.$set(this.navigatedIndex, listCode, 0);

                    this.renderPopup(virtualNode, listCode);
                };
            },
            destroyPopupAndClearVars(listCode) {
                this.$set(this.queries, listCode, null);
                this.$set(this.filteredItems, listCode, this.allItems[listCode].slice());
                this.$set(this.insertRange, listCode, null);
                this.$set(this.navigatedIndex, listCode, 0);

                this.destroyPopup(listCode);
            },
            makeOnExit(listCode) {
                return () => {
                    this.destroyPopupAndClearVars(listCode);
                }
            },
            makeOnKeyDown(listCode) {
                return ({event}) => {
                    let eventProcessed = false;

                    if (event.key === 'ArrowUp') {
                        this.upHandler(listCode);
                        eventProcessed = true;
                    }

                    if (event.key === 'ArrowDown') {
                        this.downHandler(listCode);
                        eventProcessed = true;
                    }

                    if (event.key === 'Enter') {
                        this.enterHandler(listCode);
                        eventProcessed = true;
                    }

                    if (eventProcessed) {
                        this.refreshPopup(listCode);
                    }

                    return eventProcessed;
                }
            },
            makeOnFilter() {
                return (items, query) => {
                    if (!query) {
                        return items;
                    }

                    const fuse = new Fuse(items, {
                        threshold: 0.2,
                        keys: ['text'],
                    })

                    return fuse.search(query).map( resultItem => resultItem.item );
                }
            },

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
            hasAddItem(listCode) {
                return listCode !== 'mention';
            },
            isExtendedList(listCode) {
                return listCode === 'achievement';
            },
            maxItemIndex(listCode) {
                let extraItemsCount = this.hasAddItem(listCode) ? 1 : 0;
                let lastListIndex = this.filteredItems[listCode].length-1;
                return lastListIndex + extraItemsCount;
            },
            upHandler(listCode) {
                let newIndex = this.navigatedIndex[listCode] - 1;

                if (newIndex < 0) {
                    newIndex = this.maxItemIndex(listCode);
                }

                this.$set(this.navigatedIndex, listCode, newIndex);
            },
            downHandler(listCode) {
                let newIndex = this.navigatedIndex[listCode] + 1;

                if (newIndex > this.maxItemIndex(listCode)) {
                    newIndex = 0;
                }

                this.$set(this.navigatedIndex, listCode, newIndex);
            },
            enterHandler(listCode) {
                let navigatedIndex = this.navigatedIndex[listCode];
                let item = this.filteredItems[listCode][navigatedIndex];

                if (item) {
                    return this.selectItem(navigatedIndex, listCode);
                }

                if (this.hasAddItem(listCode)) {
                    return this.insertNewItem(listCode);
                }
            },

            isPopupVisible(listCode) {
                return Boolean(this.popup[listCode]);
            },
            selectItem(index, listCode) {
                let item = this.filteredItems[listCode][index];

                let insertFunction = this.insertNodes[listCode];
                insertFunction({
                    range: this.insertRange[listCode] || this.editorSelectionRange,
                    attrs: {
                        icon: item.icon || '',
                        color: item.color || '',
                        text: item.text || '',
                        edit: item.edit || false,
                    },
                })
                this.editor.focus();

                if (this.popup[listCode]) {
                    this.destroyPopupAndClearVars(listCode);
                }
            },
            insertNewItem(listCode) {
                let insertFunction = this.insertNodes[listCode];
                let defaultIcon = 'mdi-forum-outline';
                let defaultColor = '#ffffff';

                insertFunction({
                    range: this.insertRange[listCode] || this.editorSelectionRange,
                    attrs: {
                        icon: this.isExtendedList(listCode) ? defaultIcon : '',
                        color: this.isExtendedList(listCode) ? defaultColor : '',
                        text: '',
                        edit: true,
                    },
                })
                this.editor.focus();

                if (this.popup[listCode]) {
                    this.destroyPopupAndClearVars(listCode);
                }
            },

            insertNewDateTime() {
                return this.editor.commands.datetime({
                    value: moment().add(1, 'h').startOf('hour').toDate()
                });
            },

            refreshPopup(listCode) {
                if (this.popup[listCode]) {
                    this.$nextTick( () => {
                        let content = this.$refs[listCode][0];
                        this.popup[listCode][0].setContent(content);
                    });
                }
            },
            renderPopup(node, listCode) {
                if (this.popup[listCode]) {
                    this.refreshPopup(listCode);
                    return;
                }

                let content = this.$refs[listCode][0];

                this.popup[listCode] = tippy('.v-application', {
                    getReferenceClientRect: node.getBoundingClientRect,
                    appendTo: () => document.body,
                    interactive: true,
                    sticky: true,
                    plugins: [sticky],
                    content: content,
                    trigger: 'mouseenter',
                    showOnCreate: true,
                    placement: 'top-start',
                    inertia: true,
                    duration: [400, 200],
                });
            },
            destroyPopup(listCode) {
                if (this.popup[listCode]) {
                    this.popup[listCode][0].destroy()
                    this.popup[listCode] = null
                }
            },
            showStandalone(listCode, event) {
                let realNode = event.target;
                let virtualNode = realNode ? {
                    getBoundingClientRect: () => realNode.getBoundingClientRect(),
                    clientWidth: realNode.clientWidth,
                    clientHeight: realNode.clientHeight
                } : null;

                this.destroyPopupAndClearVars(listCode);
                this.renderPopup(virtualNode, listCode);
            },
            textChanged({getJSON, getHTML}) {
                this.commentData = getJSON();
                this.htmlContent = getHTML();

                this.syncFiles();
            },
            resolveReadonlyClick(result) {
                let docChanged = Boolean(result && result.transaction && result.transaction.docChanged);

                if (this.isReadonlyClickProcessed) {
                    this.readonlyClickProcessedResolve(docChanged);
                }
            },

            gotoBoardAndFilterByTag(tag) {
                let card = this.card || this.$store.state.card.currentCard;
                let board = this.$store.getters.boardByCard( card );
                this.$store.dispatch('toggleTagFilterValue', {board: board, filterName: tag.tagClass, toggledValue: tag});
                return this.$router.push({name: 'board', params: {boardId: board.id}});
            },

            async readOnlyClicked(event) {
                if (event.isSyntetic) {
                    return;
                }

                let isHrefClicked = event.target.tagName === 'A' && event.target.getAttribute('href').length > 0;
                if (isHrefClicked) {
                    return;
                }

                let isTagClicked = event.target.classList.contains('tag-chip') || event.target.classList.contains('hashtag');
                if (isTagClicked) {
                    let getAttrs = (new TagListNode).schema.parseDOM[0].getAttrs;
                    let nodeAttrs = getAttrs(event.target);
                    return this.gotoBoardAndFilterByTag(nodeAttrs);
                }

                let dispatchedClick = new Promise(resolve => {
                    this.readonlyClickProcessedResolve = resolve;

                    this.editor.setOptions({
                        editable: true,
                    });

                    let clickedElement = event.target;
                    let repeatClickEvent = new MouseEvent("click", {
                        view: event.view,
                        bubbles: true,
                        cancelable: false
                    });
                    repeatClickEvent.isSyntetic = true;

                    clickedElement.dispatchEvent(repeatClickEvent);

                    let processingTimeout = 100;
                    setTimeout(this.readonlyClickProcessedResolve, processingTimeout);
                });

                let docChanged = await dispatchedClick;

                this.editor.setOptions({
                    editable: false,
                });
                this.readonlyClickProcessedResolve = false;

                if (docChanged) {
                    this.commitReadonlyChanges();
                }
            },
            syncFiles() {
                let textFileIds = this.files.map( attrs => attrs.id );
                let filteredFilesToUpload = this.filesToUpload.filter( fileToUpload => textFileIds.indexOf(fileToUpload.id) !== -1 );
                this.filesToUpload = filteredFilesToUpload;
            },
            selectFile() {
                this.$refs.fileInput.click();
            },
            fileSelected() {
                let file = this.$refs.fileInput.files[0];
                let fileId = shortid.generate();
                file.id = fileId;

                this.filesToUpload.push({
                    id: fileId,
                    data: file,
                });

                this.editor.commands.file({
                    id: fileId,
                    fileName: file.name,
                    url: ''
                });
            },

            getNodeText(node) {
                if (node.text) {
                    return node.text;
                }

                if (node.content) {
                    let childTexts = node.content.map( child => this.getNodeText(child) );
                    return childTexts.join(' ').replace(/ +$/, '');
                }

                return "";
            },


            dispatchEditorNodeUpdate(node, attrUpdate) {
                let dispatch = this.editor.view.dispatch;
                let transactions = this.editor.state.tr;

                let fullNodeAttrs = Object.assign(node.attrs, attrUpdate);
                let nodePos = this.getNodePos(node);
                let updateAttrsTransaction = transactions.setNodeMarkup(nodePos, null, fullNodeAttrs);

                dispatch( updateAttrsTransaction );

                return true;
            },

            getEditorNode(searchNode) {
                let contentSize = this.editor.state.doc.content.size;
                for (let currentPos = 0; currentPos <= contentSize; currentPos++) {
                    let resolvedPos = this.editor.state.doc.resolve(currentPos);
                    let nodeAtPos = resolvedPos.nodeAfter;

                    if (nodeAtPos === null) {
                        return false;
                    }

                    let sameAttrs = nodeAtPos.attrs === searchNode.attrs;
                    let sameType = nodeAtPos.type.name === searchNode.type;
                    let isNodeFound = sameAttrs && sameType;

                    if (isNodeFound) {
                        return {pos: currentPos, node: nodeAtPos};
                    }
                }

                return false;
            },

            getNodePos(searchNode) {
                let searchResult = this.getEditorNode(searchNode);

                if (searchResult) {
                    return searchResult.pos;
                }

                return false;
            },

            getMarkedNodesFromComment(markType) {
                let hasContent = this.commentData && this.commentData.content;
                if (!hasContent) {
                    return [];
                }

                return this.getNodesFromTextTree(this.commentData.content, false, markType);
            },

            getNodesFromComment(searchType) {
                let hasContent = this.commentData && this.commentData.content;
                if (!hasContent) {
                    return [];
                }

                return this.getNodesFromTextTree(this.commentData.content, searchType);
            },

            getNodesFromTextTree(tree, searchType, markType) {
                return tree.reduce( (foundNodes, node) => {
                    let hasSubtree = typeof(node.content) !== 'undefined';

                    if (hasSubtree) {
                        let subNodes = this.getNodesFromTextTree(node.content, searchType, markType);
                        foundNodes = foundNodes.concat(subNodes);
                    }

                    let nodeMatches = node.type === searchType;
                    if (markType) {
                        let hasMarks = typeof(node.marks) !== 'undefined';
                        if (hasMarks) {
                            let markTypes = node.marks.map( mark => mark.type );
                            let hasMarkType = markTypes.indexOf(markType) !== -1;

                            if (searchType) {
                                nodeMatches = nodeMatches && hasMarkType;
                            }
                            else {
                                nodeMatches = hasMarkType;
                            }
                        }
                    }

                    if (nodeMatches) {
                        foundNodes.push(node);
                    }

                    return foundNodes;
                }, []);
            },

            async uploadFilesAndUpdateNodes() {
                this.syncFiles();

                let uploadPromises = this.filesToUpload.map( fileToUpload => {
                    let requestData = new FormData();
                    requestData.append('file', fileToUpload.data);
                    requestData.append('fileId', fileToUpload.id);

                    return axios.post( '/api/file/upload',
                        requestData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        }
                    );
                });

                let uploadResults = await Promise.all(uploadPromises);
                let fileNodes = this.getNodesFromComment('file');

                uploadResults.forEach( uploadResult => {
                    let downloadUrl = uploadResult.data.relativeUrl;
                    let fileId = uploadResult.data.fileId;

                    let node = fileNodes.find( node => node.attrs.id === fileId );

                    if (node) {
                        this.dispatchEditorNodeUpdate(node, {url: downloadUrl});
                    }
                });
            },

            commitNewListElements() {
                this.lists.filter(listCode => listCode !== 'mention').forEach( listCode => {
                    let allNodes = this.getNodesFromComment(listCode);
                    let editingNodes = allNodes.filter( node => node.attrs.edit );

                    editingNodes.forEach( editingNode => {
                        this.dispatchEditorNodeUpdate(editingNode, {edit: false});
                    });
                });
            },

            commitNewDates() {
                this.getNodesFromComment('datetime')
                    .filter( node => node.attrs.edit )
                    .forEach( datetimeNode => {
                        this.dispatchEditorNodeUpdate(datetimeNode, {edit: false});
                    });
            },

            async commitChanges() {
                await this.uploadFilesAndUpdateNodes();
                this.commitNewListElements();
                this.commitNewDates();

                let commentData = {
                    text: this.htmlContent,
                    data: {
                        files: this.files,
                        dates: this.dates,
                        users: this.users,
                        likes: this.likes,
                        todos: this.todos,
                        links: this.links,
                    }
                }

                this.lists.filter(listCode => listCode !== 'mention').forEach(listCode => {
                    let nodes = this.getNodesFromComment(listCode);
                    let items = nodes.map( node => node.attrs );

                    commentData.data[listCode] = items;
                });

                this.$emit('input', commentData);
            },
            async commitReadonlyChanges() {
                let updatedComment = Object.assign(this.value, {
                    text: this.htmlContent,
                    data: {
                        files: this.files,
                        dates: this.dates,
                        users: this.users,
                        likes: this.likes,
                        todos: this.todos,
                        links: this.links,
                    }
                });

                this.$emit('readonlyUpdate', updatedComment);
            },
            commitChangesIfFocused() {
                if (this.editor.focused) {
                    return this.commitChanges();
                }
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
    .is-mobile .v-toolbar__content {
        padding-left: 0px;
    }

    .is-mobile .v-toolbar__content .v-btn.v-btn--icon.v-size--default {
        width: 44px;
    }

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
    .editor .date-time-container[data-edit="1"] {
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

    .editor .mention,
    .editor .hashtag,
    .editor a {
        color: var(--v-anchor-base);
        text-shadow: none!important;
    }

    .tag-chip {
        border-radius: 4px !important;
        align-items: center;
        display: inline-flex;
        line-height: 20px;
        max-width: 100%;
        outline: none;
        overflow: hidden;
        padding: 0 4px;
        position: relative;
        text-decoration: none;
        vertical-align: middle;
        white-space: nowrap;
        font-size: 12px;
        height: 24px;
    }

    .tag-chip::before {
        font-size: 200%;
        margin-right: 4px;
    }


    a[data-file] {
        border: thin solid rgba(0, 0, 0, 0.12)!important;
        border-radius: 4px;
        color: rgba(0, 0, 0, 0.87)!important;
        text-shadow: none!important;
        font-size: 14px;
        height: 32px;
        cursor: pointer;

        display: inline-flex;
        line-height: 20px;
        max-width: 100%;
        outline: none;
        overflow: hidden;
        padding: 0 12px;
        position: relative;
        text-decoration: none;
        align-items: center;
    }

    a[data-file]::before {
        display: inline-block;
        font: normal normal normal 24px/1 "Material Design Icons";
        content: "\F3E2";
        margin-right: 8px;
    }

    .hide-cursor-when-editing-on [contenteditable] {
        caret-color: transparent;
    }

    .send-button .v-btn__content {
        flex-direction: column !important;
    }
</style>