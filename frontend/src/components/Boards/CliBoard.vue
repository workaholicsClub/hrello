<template>
    <v-main class="fill-height">
        <v-row class="mx-2 mx-md-4">
            <v-col cols="12" md="6" lg="4" v-for="card in filteredCards" :key="card.id">
                <card
                        :card="card"
                        :almost-finished="false"
                        :statuses="statuses"
                        :show-avatar="false"
                        :comment-index="0"
                        :small="true"
                        :class="{'mentioned': isCardMentioned(card)}"
                ></card>
            </v-col>
        </v-row>
        <v-row class="align-items-center command-container">
            <v-col cols="12" class="p-3">
                <v-chip x-small color="primary" v-if="filter">{{filter}}</v-chip>
                <v-text-field
                        ref="commandField"
                        outlined
                        clearable
                        append-icon="mdi-magnify"
                        placeholder="Команда"
                        hint="Нажмите / для выбора"
                        persistent-hint
                        v-model="command"
                        class="mt-4 white"
                ></v-text-field>
            </v-col>
        </v-row>
        <input type="file" style="display: none" ref="fileInput" @change="addNewResume">
    </v-main>
</template>

<script>
    import Card from "../Card.vue"
    import BoardsCommon from "@/mixins/BoardsCommon";

    export default {
        name: "CliBoard",
        components: {
            Card,
        },
        mixins: [BoardsCommon],
        data() {
            return {
                filter: '',
                command: '',
                prevCommand: '',
            }
        },
        mounted() {
            this.enableKeyFocus();
        },
        beforeDestroy () {
            this.disableKeyFocus();
        },
        methods: {
            enableKeyFocus() {
                document.onkeydown = e => {
                    e = e || window.event;
                    if (
                        e.key === "/" &&
                        e.target !== this.$refs.commandField.$refs.input
                    ) {
                        e.preventDefault();
                        this.$refs.commandField.focus();
                    }

                    if (e.key === 'Enter') {
                        this.runCommand();
                    }

                    if (e.key === 'Up') {
                        this.command = this.prevCommand;
                    }
                }
            },
            normalizeCommand(shortCommand) {
                let commands = [
                    'фильтр', 'filter', 'резюме', 'resume', 'комментарий', 'comment', 'статус', 'status',
                    'этап', 'архив', 'удалить', 'delete', 'archive'
                ]

                let matchingCommands = commands.filter( command => command.indexOf( shortCommand.toLocaleLowerCase() ) === 0 );
                if (matchingCommands.length === 1) {
                    return matchingCommands[0];
                }

                return shortCommand.toLocaleLowerCase();
            },
            runCommand() {
                let commandToExec = this.command;
                let commandType = this.normalizeCommand( commandToExec.split(' ')[0] );
                let commandArgs = commandToExec.replace(new RegExp('^' + commandToExec.split(' ')[0] +' *'), '');
                let argsWithoutScopes = commandArgs.split(' ').filter(arg => arg[0] !== '@').join(' ');

                switch (commandType) {
                    case 'фильтр':
                    case 'filter':
                        this.setFilter(commandArgs);
                        break;
                    case 'резюме':
                    case 'resume':
                        this.selectFile();
                        break;
                    case 'комментарий':
                    case 'comment':
                        this.addComment(commandToExec, argsWithoutScopes);
                        break;
                    case 'статус':
                    case 'этап':
                    case 'status':
                        this.changeStatus(commandToExec, argsWithoutScopes);
                        break;
                    case 'архив':
                    case 'удалить':
                    case 'delete':
                        this.archiveCards(commandToExec);
                        break;
                    default:
                        if (commandType[0] === '#' || commandType[0] === '$') {
                            this.setFilter(commandType);
                        }
                        break;
                }

                this.resetCommand();
            },
            addComment(command, newCommentText) {
                let cards = this.getScopedCards(command, this.filteredCards);

                for (let card of cards) {
                    this.$root.$emit('newContentCard', {
                        type: 'comment',
                        author: this.user,
                        text: newCommentText,
                    }, card, this.board);
                }
            },
            changeStatus(command, newStatusName) {
                let newStatus = this.statuses.find( status => status.title.toLocaleLowerCase().indexOf( newStatusName.toLocaleLowerCase() ) !== -1 );
                let cards = this.getScopedCards(command, this.filteredCards);

                if (newStatus) {
                    for (let card of cards) {
                        this.$root.$emit('moveCardToStatus', card, newStatus);
                    }
                }
            },
            archiveCards(command) {
                let cards = this.getScopedCards(command, this.filteredCards);

                for (let card of cards) {
                    this.$root.$emit('moveCardToFinishedList', card);
                }
            },
            getScopes(command) {
                return command.split(' ').filter(arg => arg[0] === '@').map( scope => scope.replace(/^@/, '').toLocaleLowerCase() ) || [];
            },
            getScopedCards(command, cards) {
                let scopes = this.getScopes(command);
                if (scopes.length > 0) {
                    return this.filterCardsByScope(scopes, cards);
                }

                return cards;
            },
            statusName(card) {
                let status = this.statuses.find(status => status.id === card.statusId);
                return status ? status.title.toLocaleLowerCase() : '';
            },
            isCardMentioned(card) {
                let scopes = this.getScopes(this.command);
                if (scopes.length > 0) {
                    return this.filterCardsByScope(scopes, [card]).length > 0;
                }

                return false;
            },
            filterCardsByScope(scopes, cards) {
                return cards.filter(card => {
                    let scopeMatch = scopes
                        .map(scope => {
                            let isNegative = scope[0] === '!' || scope[0] === '-';
                            scope = scope.replace(/!/, '').replace(/^-/, '');

                            if (isNegative) {
                                return this.cardText(card).indexOf(scope) === -1 && this.statusName(card).indexOf(scope) === -1;
                            }
                            else {
                                return this.cardText(card).indexOf(scope) !== -1 || this.statusName(card).indexOf(scope) !== -1;
                            }
                        })
                        .reduce( (totalMatch, scopeMatch) => totalMatch && scopeMatch, true );

                    return scopeMatch;
                });
            },
            setFilter(newFilter) {
                this.filter = newFilter;
            },
            resetCommand() {
                this.command = '';
            }
        },
        computed: {
            filteredCards() {
                return this.getScopedCards(this.filter, this.cards);
            }
        }
    }
</script>

<style scoped>
    .mentioned {
        border: 4px solid red;
    }

    .command-container {
        position: fixed;
        bottom: 0;
        background-color: #e7f2f5;
        padding: 0 40px 0 20px;
        width: 100%;
    }
</style>