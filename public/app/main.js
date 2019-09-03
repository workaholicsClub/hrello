function getRandom(array, count) {
    let records = [];

    for (let index = 1; index <= count; index++) {
        let randomIndex = Math.round(Math.random()*(array.length-1));
        records.push(array[randomIndex]);
    }

    return records;
}
function getTestCandidates() {
    return [
        {id: 1, name: 'Николюк Остап', position: '1С Программист', statusId: 1, boardId: '5d1f63f55f725d8d26ef3e13',
            statusData: {},
            additionalFields: [],
            sort: 0
        },
        {id: 2, name: 'Ярков Антон', position: 'Аналитик', statusId: 1, boardId: '5d1f63f55f725d8d26ef3e13', sort: 1},
        {id: 3, name: 'Сапалёв Виктор', position: '1С Программист', statusId: 1, boardId: '5d1f63f55f725d8d26ef3e13', sort: 2},
        {id: 4, name: 'Караваев Эдуард', position: 'Помощник бухгалтера', statusId: 1, boardId: '5d1f63f55f725d8d26ef3e13', sort: 3},
        {id: 5, name: 'Кулигин Степан', position: 'Стажер', statusId: 1, boardId: '5d1f63f55f725d8d26ef3e13', sort: 4},
        {id: 6, name: 'Уманов Константин', position: 'Стажер', statusId: 1, boardId: '5d1f63f55f725d8d26ef3e13', sort: 5},
        {id: 7, name: 'Звягин Захар', comment: 'Настойчив', statusId: 2, boardId: '5d1f63f55f725d8d26ef3e13', sort: 0},
        {id: 8, name: 'Ярославцев Иван', position: 'Стажер', statusId: 2, boardId: '5d1f63f55f725d8d26ef3e13', sort: 1},
        {id: 9, name: 'Ошурков Павел', position: 'Бухгалтер', statusId: 2, boardId: '5d1f63f55f725d8d26ef3e13', sort: 2},
        {id: 10, name: 'Ячменцев Тарас', position: 'Стажер', statusId: 2, boardId: '5d1f63f55f725d8d26ef3e13', sort: 3},
        {id: 11, name: 'Бабкина Елена', comment: 'Вторая попытка', statusId: 3, boardId: '5d1f63f55f725d8d26ef3e13', sort: 0},
        {id: 12, name: 'Кривова Ника', position: 'Аналитик', statusId: 3, boardId: '5d1f63f55f725d8d26ef3e13', sort: 1},
        {id: 13, name: 'Репина Дарья', position: '1С Программист', statusId: 3, boardId: '5d1f63f55f725d8d26ef3e13', sort: 2},
        {id: 14, name: 'Веретёнова Виктория', comment: 'Нужно уточнить про паспорт', statusId: 4, boardId: '5d1f63f55f725d8d26ef3e13', sort: 0},
        {id: 15, name: 'Курдина Яна', position: 'Стажер', statusId: 4, boardId: '5d1f63f55f725d8d26ef3e13', sort: 1},
        {id: 16, name: 'Ерофеева Ирина', position: 'Помощник бухгалтера', statusId: 5, boardId: '5d1f63f55f725d8d26ef3e13', sort: 0},
        {id: 17, name: 'Чекудаева Лидия', position: 'Помощник бухгалтера', statusId: 5, boardId: '5d1f63f55f725d8d26ef3e13', sort: 1},
        {id: 18, name: 'Ковпак Вера', position: 'Бухгалтер', statusId: 5, boardId: '5d1f63f55f725d8d26ef3e13', sort: 2},
        {id: 19, name: 'Кравец Регина', position: 'Бухгалтер', statusId: 5, boardId: '5d1f63f55f725d8d26ef3e13', sort: 3},
        {id: 20, name: 'Гнусарева Анна', position: 'Аналитик', statusId: 5, boardId: '5d1f63f55f725d8d26ef3e13', sort: 4}
    ];
}
function getTestStatuses() {
    let testStatuses = [
        {
            id: 1,
            title: 'Входящие',
            fields: [],
            boardId: '5d1f63f55f725d8d26ef3e13'
        },
        {
            id: 2,
            title: 'Интервью',
            fields: [
                {'title': 'Телефонное интервью', 'type': 'checkbox', 'id': 'i0', sort: 1},
                {'title': 'Тестирование', 'type': 'checkbox', 'id': 'i1', sort: 2}
            ],
            boardId: '5d1f63f55f725d8d26ef3e13'
        },
        {
            id: 3,
            title: 'Собеседование',
            fields: [
                {'title': 'HR', 'type': 'color', 'id': 'i2', sort: 1},
                {'title': 'Дата команды', 'type': 'datetime', 'id': 'i21', sort: 2},
                {'title': 'С командой', 'type': 'color', 'id': 'i3', sort: 3}
            ],
            boardId: '5d1f63f55f725d8d26ef3e13'
        },
        {
            id: 4,
            title: 'Оффер',
            fields: [
                {'title': 'Подтверждение руководителем', 'type': 'color', 'id': 'i4', sort: 1},
                {'title': 'Проверка СБ', 'type': 'color', 'id': 'i5', sort: 2},
                {'title': 'Подтверждение кандидатом', 'type': 'checkbox', 'id': 'i6', sort: 3},
                {'title': 'Оповещение группы', 'type': 'checkbox', 'id': 'i7', sort: 4}
            ],
            boardId: '5d1f63f55f725d8d26ef3e13'
        },
        {
            id: 5,
            title: 'Выход на работу',
            fields: [
                {'title': 'Дата выхода', 'type': 'date', 'id': 'i8', sort: 1},
                {'title': 'Документы кандидата', 'type': 'checkbox', 'id': 'i9', sort: 2},
                {'title': '«Buddy»', 'type': 'text', 'id': 'i10', sort: 3},
                {'title': 'Выход', 'type': 'checkbox', 'id': 'i12', sort: 4}
            ],
            boardId: '5d1f63f55f725d8d26ef3e13'
        },
    ];

    return testStatuses;
}
function zeroPad(num) {
    return num < 10 ? '0'+num : num;
}
function sortByIndex(items) {
    if (typeof (items) === 'undefined') {
        return [];
    }
    let itemsCopy = items.concat();

    return itemsCopy.sort((a, b) => a.sort - b.sort);
}


Vue.component('status', {
    template: '#status-template',
    props: ['status', 'cards', 'drag_card', 'candidate_fields', 'next_status', 'next_status_cards', 'all_statuses'],
    data() {
        return {
            hidden: false
        }
    },
    methods: {
        toggleHide() {
            this.hidden = !this.hidden;
        },
        minimize() {
            Vue.set(this.status, 'minimized', true);
        },
        maximize() {
            Vue.set(this.status, 'minimized', false);
        },
        archiveCard(card) {
            this.$emit('update_card', {
                card: card,
                fieldId: 'archive',
                value: true,
                isWorkflowField: false
            });
        },
        updateCardData(cardFieldData) {
            this.$emit('update_card', cardFieldData);
        },

        rememberDraggedCard(event) {
            let draggedCard = this.cards[event.oldIndex];
            this.$emit('drag_card', draggedCard);
        },

        forgetDraggedCard(event) {
            this.$emit('drag_card', false);
        },

        moveCardsUpList(cardsToMoveUp) {
            cardsToMoveUp.forEach(currentCard => {
                this.$emit('update_card', {
                    card: currentCard,
                    fieldId: 'sort',
                    value: currentCard.sort-1,
                    isWorkflowField: false
                });
            });
        },

        moveCardsDownList(cardsToMoveDown) {
            cardsToMoveDown.forEach(currentCard => {
                this.$emit('update_card', {
                    card: currentCard,
                    fieldId: 'sort',
                    value: currentCard.sort+1,
                    isWorkflowField: false
                });
            });
        },

        cardAccepted(event) {
            let newCard = this.drag_card;
            let cardsToMoveDown = this.cards
                .filter(card => card.sort >= event.newIndex)
                .filter(card => card.id !== newCard.id);
            this.moveCardsDownList(cardsToMoveDown);

            this.$emit('update_card', {
                card: newCard,
                fieldId: 'sort',
                value: event.newIndex,
                isWorkflowField: false
            });
        },

        cardRemoved(event) {
            let cardsToMoveUp = this.cards.slice(event.oldIndex);
            this.moveCardsUpList(cardsToMoveUp);
        },

        sortChanged(event) {
            let changedCard = this.cards[event.oldIndex];
            let cardMovedUp = event.newIndex < event.oldIndex;

            if (cardMovedUp) {
                let cardsToMoveDown = this.cards.slice(event.newIndex, event.oldIndex);
                this.moveCardsDownList(cardsToMoveDown);
            }
            else {
                let cardsToMoveUp = this.cards.slice(event.oldIndex+1, event.newIndex+1);
                this.moveCardsUpList(cardsToMoveUp);
            }

            this.$emit('update_card', {
                card: changedCard,
                fieldId: 'sort',
                value: event.newIndex,
                isWorkflowField: false
            });

        },
        moveCardToNextStatus(card) {
            let cardIndex = this.cards.indexOf(card);

            if (this.next_status) {
                this.$emit('update_card', {
                    card: card,
                    fieldId: 'statusId',
                    value: this.next_status.id,
                    isWorkflowField: false
                });
            }
            else {
                this.archiveCard(card);
            }

            let cardsToMoveUp = this.cards.slice(cardIndex);
            this.moveCardsUpList(cardsToMoveUp);
        }
    },
    computed: {
        currentCards: {
            get() {
                return this.cards;
            },
            set(value) {
                let movedCards = value.filter((card) => card.statusId !== this.status.id);
                movedCards.forEach((card) => {
                    Vue.set(card, 'statusId', this.status.id);
                });
            }
        },
        cardsCount() {
            return this.currentCards ? this.currentCards.length : 0;
        },
        isEmpty() {
            return this.cardsCount === 0;
        }
    }
});

Vue.component('card', {
    template: '#card-template',
    props: ['card', 'fields', 'candidate_fields', 'minimized', 'status', 'next_status', 'all_statuses'],
    data() {
        return {
            currentMinimized: Boolean(this.minimized),
            modalEdit: false
        }
    },
    watch: {
        minimized: function () {
            this.currentMinimized = Boolean(this.minimized);
        }
    },
    methods: {
        minimize() {
            this.currentMinimized = true;
        },
        maximize() {
            this.currentMinimized = false;
        },
        onFieldUpdate(fieldData) {
            let fieldId = fieldData.fieldId;
            let value = fieldData.value;

            this.$emit('field_update', {
                card: this.card,
                fieldId: fieldId,
                value: value,
                isWorkflowField: true
            });
        },
        onCandidateFieldUpdate(fieldData) {
            let fieldId = fieldData.fieldId;
            let value = fieldData.value;

            this.$emit('field_update', {
                card: this.card,
                fieldId: fieldId,
                value: value,
                isWorkflowField: false
            });
        },
        openModalEdit() {
            $('#' + this.modalEditId).modal('show');
        },
        closeModalEdit() {
            $('#' + this.modalEditId).modal('hide');
        },
        getFieldValue(field) {
            if (!field) {
                return undefined;
            }

            let hasValue =
                typeof (this.card['statusData']) != 'undefined' &&
                typeof (this.card.statusData[field.id]) != 'undefined';

            return hasValue ? this.card.statusData[field.id] : undefined;
        },
        getCandidateFieldValue(field) {
            if (!field) {
                return undefined;
            }

            let hasValue = typeof (this.card[field.id]) != 'undefined';

            return hasValue ? this.card[field.id] : undefined;
        },
        archive() {
            this.$emit('archive');
        }
    },
    computed: {
        activeField() {
            if (!this.fields) {
                return false;
            }

            let lastFieldWithData = this.fields.reduce((foundField, currentField) => {
                let currentValueDefined =
                    typeof (this.card['statusData']) !== 'undefined' &&
                    typeof (this.card.statusData[currentField.id]) !== 'undefined';
                if (currentValueDefined) {
                    foundField = currentField;
                }

                return foundField;
            }, false);

            return lastFieldWithData;
        },
        activeValue() {
            if (!this.activeField) {
                return false;
            }

            if (!this.card['statusData']) {
                return false;
            }

            return this.card.statusData[this.activeField.id];
        },
        isCompleted() {
            if (!this.fields || this.fields.length === 0) {
                return true;
            }

            let lastField = this.fields[ this.fields.length - 1 ];
            let isLastField = this.activeField.id === lastField.id;
            let hasValue =
                typeof (this.card['statusData']) != 'undefined' &&
                typeof (this.card.statusData[lastField.id]) != 'undefined';
            return isLastField && hasValue;
        },
        modalEditId() {
            return 'edit_modal_'+this._uid;
        },
        sortedFields() {
            return sortByIndex(this.fields);
        }
    }
});

let FieldComponent = Vue.extend({
    props: ['field', 'value', 'onlyValue', 'is_inline'],
    data() {
        return {
            isEditing: false,
            editingValue: this.field.type === 'text' ? '' : false,
            savedValue: undefined,
        }
    },
    methods: {
        save(newValue) {
            if (typeof (newValue) === 'undefined') {
                newValue = this.editingValue;
            }

            this.savedValue = newValue;
        },
        toggleEditing() {
            this.isEditing = !this.isEditing;
        },
    },
    computed: {
        formattedDate() {
            if (this.value) {
                let date = new Date(this.value);
                let dd = zeroPad( date.getDate() );
                let mm = zeroPad( date.getMonth() + 1 );
                let yyyy = date.getFullYear();

                return dd+'.'+mm+'.'+yyyy;
            }

            return '';
        },
        formattedDateTime() {
            if (this.value) {
                let date = new Date(this.value);
                let dd = zeroPad( date.getDate() );
                let mm = zeroPad( date.getMonth() + 1 );
                let hh = zeroPad( date.getHours() );
                let mn = zeroPad( date.getMinutes() );

                return `${hh}:${mn} ${dd}.${mm}`;
            }

            return '';
        },
        isFilled() {
            return typeof (this.value) != 'undefined' && this.value !== null;
        },
        fullView() {
            return !this.onlyValue;
        }
    },
    watch: {
        value() {
            this.savedValue = this.value;
        },
        savedValue() {
            this.isEditing = false;
            this.$emit('update', {
                fieldId: this.field.id,
                value: this.savedValue
            });
        }
    },
    created() {
        if (typeof (this.value) !== 'undefined') {
            this.editingValue = this.value;
            this.savedValue = this.value;
        }
    }
});

let inplaceField = FieldComponent.extend({template: '#field-template'});
let formField = FieldComponent.extend({template: '#fieldedit-template'});
Vue.component('field', inplaceField);
Vue.component('editfield', formField);

Vue.component('navmenu', {
    template: '#menu-template',
    props: ['title', 'items', 'is-authorized', 'user'],
    data() {
        return {
            minimized: false,
            googleSignInParams: {
                client_id: '209938453740-ai5knts32hpbak6e20jq9i9l6ruhgar4.apps.googleusercontent.com'
            }
        }
    },
    methods: {
        updateActiveMenu(newItem) {
            this.items.map(item => {
                item.active = item.code === newItem.code;
            });
            this.$emit('change_active', newItem);
        },
        toggleMinimize() {
            this.minimized = true;
            this.$emit('minimize');
        },
        toggleMaximize() {
            this.minimized = false;
            this.$emit('maximize');
        },
        onSignInSuccess(googleUser) {
            let googleProfile = googleUser.getBasicProfile();

            let user = {
                googleId: googleProfile.getId(),
                fullName: googleProfile.getName(),
                firstName: googleProfile.getGivenName(),
                familyName: googleProfile.getFamilyName(),
                imageUrl: googleProfile.getImageUrl(),
                email: googleProfile.getEmail()
            };

            this.$emit('authorized', user);
        },
        onSignInError(error) {
            console.log('Мамочки!', error);
        },
    },
    computed: {
    }
});

Vue.component('modal', {
    template: '#modal-template',
    props: ['id'],
    methods: {
        close() {
            this.$emit('close');
        }
    }
});

new Vue({
    el: '#board',
    data: {
        dragStartPosition: false,
        dragStartElLeft: false,
        currentBoardId: false,
        currentCardId: false,
        statuses: [], //getTestStatuses(),
        cards: [], //getTestCandidates(),
        activeSettingsStatusId: false,
        dragCard: false,

        user: false,
        loadedUserId: false,
        loadedBoards: false
    },
    watch: {
        currentBoardId: async function () {
            let statusesResponse = await axios.get('/api/status/list', {
                params: {
                    boardId: this.currentBoardId
                }
            });

            let cardsResponse = await axios.get('/api/card/list', {
                params: {
                    boardId: this.currentBoardId
                }
            });

            this.statuses = statusesResponse.data.status;
            this.cards = cardsResponse.data.card;
        },
        activeSettingsStatus: {
            async handler() {
                return this.updateStatus(this.activeSettingsStatus);
            },
            deep: true
        },
        currentBoard: {
            async handler() {
                return this.updateBoard(this.currentBoard);
            },
            deep: true
        }
    },
    methods: {
        async addCard(status) {
            let newCard = {
                statusId: status.id,
                boardId: status.boardId
            };

            let response = await axios.post('/api/card/add', newCard);
            let createdCard = response.data.card;

            this.cards.unshift(createdCard);
        },
        async updateCard(updateData) {
            let card = updateData.card;
            let valueChanged = false;

            if (updateData.isWorkflowField) {
                if (!card.statusData) {
                    Vue.set(card, 'statusData', {});
                }

                valueChanged = card['statusData'][updateData.fieldId] !== updateData.value;
                if (valueChanged) {
                    Vue.set(card['statusData'], updateData.fieldId, updateData.value);
                }
            }
            else {
                valueChanged = card[updateData.fieldId] !== updateData.value;
                if (valueChanged) {
                    Vue.set(card, updateData.fieldId, updateData.value);
                }

                if (updateData.fieldId === 'archive') {
                    let cardIndex = this.cards.indexOf(card);
                    if (cardIndex !== -1) {
                        this.cards.splice(cardIndex, 1);
                    }
                }
            }

            if (valueChanged) {
                axios.post('/api/card/update', card);
            }
        },
        async updateStatus(updateData) {
            let changedStatus = updateData;
            axios.post('/api/status/update', changedStatus);
        },
        async addStatus() {
            let newStatusTemplate = {
                boardId: this.currentBoardId,
                sort: 100,
                title: '',
                fields: [],
            };
            let addResponse = await axios.post('/api/status/add', newStatusTemplate);
            let newStatus = addResponse.data.status;

            this.statuses.push(newStatus);
        },
        async archiveActiveStatus() {
            let statusIndex = this.statuses.indexOf(this.activeSettingsStatus);
            if (statusIndex !== -1) {
                let archivedStatus = this.statuses.splice(statusIndex, 1)[0];
                await axios.get('/api/status/archive', {
                    params: {
                        statusId: archivedStatus.id
                    }
                });
            }
        },
        async addField() {
            let newIdResponse = await axios.get('/api/id/generate');
            let newId = newIdResponse.data.id;

            let newFieldTemplate = {'title': '', 'type': 'checkbox', 'id': newId, sort: 100};
            this.activeSettingsStatus.fields.push(newFieldTemplate);
        },
        async removeField(field) {
            let fieldIndex = this.activeSettingsStatus.fields.indexOf(field);
            this.activeSettingsStatus.fields.splice(fieldIndex, 1);
        },
        async updateBoard(updateData) {
            let changedBoard = updateData;
            axios.post('/api/board/update', changedBoard);
        },

        updateDragCard(card) {
            this.dragCard = card || false;
        },
        minimizeAllStatuses() {
            this.statuses.map(status => {
                Vue.set(status, 'minimized', true);
            });
        },
        maximizeAllStatuses() {
            this.statuses.map(status => {
                Vue.set(status, 'minimized', false);
            });
        },
        dragStart(event) {
            let scrollableAreaEl = document.querySelector('.task-board');
            this.dragStartPosition = event.pageX - scrollableAreaEl.offsetLeft;
            this.dragStartElLeft = scrollableAreaEl.offsetLeft;
        },
        dragEnd(event) {
            this.dragStartPosition = false;
            this.dragStartElLeft = false;
        },
        dragScroll(event) {
            let isButtonPressed = event.buttons > 0;
            if (!isButtonPressed) {
                return;
            }

            event.preventDefault();
            let scrollableAreaEl = document.querySelector('.task-board');
            let x = event.pageX - scrollableAreaEl.offsetLeft;
            let speed = 3;
            let shiftX = (x - this.dragStartPosition ) * speed;
            scrollableAreaEl.scrollLeft = this.dragStartElLeft - shiftX;
        },
        openModalSettings() {
            $('#' + this.modalBoardSettingsId).modal('show');
        },
        closeModalSettings() {
            $('#' + this.modalBoardSettingsId).modal('hide');
        },
        async addNewBoard() {
            let nextBoardNumber = this.boards.length + 1;
            let boardTemplate = {
                title: 'Доска ' + nextBoardNumber,
                userId: this.userId
            };

            let boardResponse = await axios.post('/api/board/add', boardTemplate);
            this.statuses = boardResponse.data.status;
            this.boards.push(boardResponse.data.board);
            this.currentBoardId = boardResponse.data.board.id;
            this.updateUrl();
        },
        parseUrlParts() {
            let hashParts = window.location.hash.split('/');
            return {
                boardId: hashParts[1] || false,
                cardId: hashParts[2] || false,
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
        changeActiveBoard(newBoardItem) {
            let newBoardId = newBoardItem.code;
            this.currentBoardId = newBoardId;
            this.updateUrl();
        },
        async archiveCard(card) {
            Vue.set(card, 'statusId', false);
            this.cards.splice(this.cards.indexOf(card), 1);
            await axios.get('/api/card/archive', {
                params: {
                    cardId: card.id
                }
            });
        },
        getStatusCards(searchedStatusId) {
            return this.cards
                .filter(card => card.statusId === searchedStatusId)
                .sort( (a, b) => a.sort - b.sort )
                || [];
        },
        getCandidateFields() {
            return [
                {'title': 'Полное имя', 'type': 'text', 'id': 'name', sort: 1},
                {'title': 'Должность', 'type': 'text', 'id': 'position', sort: 2},
                {'title': 'Почта', 'type': 'text', 'id': 'email', sort: 3},
                {'title': 'Телефон', 'type': 'text', 'id': 'phone', sort: 4},
                {'title': 'Ссылка на резюме', 'type': 'text', 'id': 'resumeUrl', sort: 5},
                {'title': 'Вуз', 'type': 'text', 'id': 'university', sort: 6},
                {'title': 'Комментарий', 'type': 'longtext', 'id': 'comment', sort: 7},
            ];
        },
        isStatusActiveInSettings(status) {
            return status.id === this.activeSettingsStatus.id;
        },
        resetBoards() {
            this.loadedBoards = false;
            this.currentBoardId = false;
            this.currentCardId = false;
            this.updateUrl();
        },
        async loadLocalData() {
            this.loadedUserId = localStorage.getItem('userId') || false;
            let savedUser = localStorage.getItem('authorizedUser') || false;

            if (savedUser) {
                this.user = JSON.parse(savedUser);
                return this.user.id;
            }

            if (!this.loadedUserId) {
                let response = await axios.post('/api/user/add', {});
                let newUserId = response.data.user.id;

                this.loadedUserId = newUserId;
                localStorage.setItem('userId', newUserId);
            }
        },
        loadUrlData() {
            let hashParts = this.parseUrlParts();

            if (hashParts.boardId) {
                this.currentBoardId = hashParts.boardId;
            }

            if (hashParts.cardId) {
                this.currentCardId = hashParts.cardId;
            }
        },
        async login(profile) {
            let response = await axios.post('/api/user/login', profile);
            this.user = response.data.user;
            localStorage.setItem('authorizedUser', JSON.stringify(this.user));

            this.resetBoards();
        },
        logout() {
            this.user = false;
            localStorage.removeItem('authorizedUser');

            this.resetBoards();
        }
    },
    computed: {
        title() {
            let currentItem = this.menuItems.filter(item => item.active)[0] || false;
            return currentItem ? currentItem.title : 'Доска не выбрана';
        },
        menuItems() {
            if (!this.boards) {
                return [];
            }

            let menuItems = this.boards.map((board, index) => {
                return {
                    code: board.id,
                    title: board.title,
                    active: this.currentBoardId ? (board.id === this.currentBoardId) : (index === 0),
                };
            });
            return menuItems;
        },
        modalBoardSettingsId() {
            return 'board_settings_modal_'+this.currentBoardId;
        },
        activeSettingsStatus() {
            if (!this.activeSettingsStatusId) {
                return this.statuses[0] || false;
            }

            return this.statuses.reduce((found, current) => {
                return current.id === this.activeSettingsStatusId ? current : found;
            });
        },
        currentBoard() {
            if (!this.currentBoardId || !this.boards) {
                return false;
            }

            let foundBoards = this.boards.filter(board => board.id === this.currentBoardId);
            return foundBoards.length > 0 ? foundBoards[0] : false;
        },
        sortedStatuses() {
            return sortByIndex(this.statuses);
        },
        activeSettingsSortedFields() {
            return sortByIndex(this.activeSettingsStatus.fields);
        },
        isAuthorized() {
            return this.user !== false;
        }
    },
    asyncComputed: {
        userId: {
            get() {
                if (this.user) {
                    return this.user.id;
                }

                return this.loadedUserId;
            },
            set(newValue) {
                this.loadedUserId = newValue;
                localStorage.setItem('userId', newValue);
            }
        },
        boards: {
            async get() {
                if (this.loadedBoards) {
                    return this.loadedBoards;
                }

                if (!this.userId) {
                    return [];
                }

                let response = await axios.get('/api/board/list', {
                    params: {
                        userId: this.userId
                    }
                });
                this.loadedBoards = response.data.board;
            },
            set(newValue) {
                this.loadedBoards = newValue;
            }
        }
    },

    created() {
        this.loadUrlData();
        this.loadLocalData();
    }
});