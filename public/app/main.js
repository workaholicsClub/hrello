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
            additionalFields: []
        },
        {id: 2, name: 'Ярков Антон', position: 'Аналитик', statusId: 1, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 3, name: 'Сапалёв Виктор', position: '1С Программист', statusId: 1, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 4, name: 'Караваев Эдуард', position: 'Помощник бухгалтера', statusId: 1, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 5, name: 'Кулигин Степан', position: 'Стажер', statusId: 1, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 6, name: 'Уманов Константин', position: 'Стажер', statusId: 1, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 7, name: 'Звягин Захар', comment: 'Настойчив', statusId: 2, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 8, name: 'Ярославцев Иван', position: 'Стажер', statusId: 2, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 9, name: 'Ошурков Павел', position: 'Бухгалтер', statusId: 2, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 10, name: 'Ячменцев Тарас', position: 'Стажер', statusId: 2, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 11, name: 'Бабкина Елена', comment: 'Вторая попытка', statusId: 3, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 12, name: 'Кривова Ника', position: 'Аналитик', statusId: 3, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 13, name: 'Репина Дарья', position: '1С Программист', statusId: 3, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 14, name: 'Веретёнова Виктория', comment: 'Нужно уточнить про паспорт', statusId: 4, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 15, name: 'Курдина Яна', position: 'Стажер', statusId: 4, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 16, name: 'Ерофеева Ирина', position: 'Помощник бухгалтера', statusId: 5, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 17, name: 'Чекудаева Лидия', position: 'Помощник бухгалтера', statusId: 5, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 18, name: 'Ковпак Вера', position: 'Бухгалтер', statusId: 5, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 19, name: 'Кравец Регина', position: 'Бухгалтер', statusId: 5, boardId: '5d1f63f55f725d8d26ef3e13'},
        {id: 20, name: 'Гнусарева Анна', position: 'Аналитик', statusId: 5, boardId: '5d1f63f55f725d8d26ef3e13'}
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

Vue.component('status', {
    template: '#status-template',
    props: ['status', 'cards', 'candidate_fields', 'next_status', 'next_status_cards', 'all_statuses'],
    data() {
        return {
            currentCards: this.cards,
            hidden: false
        }
    },
    watch: {
        cards: function () {
            this.currentCards = this.cards;
        },
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
        moveCardToNextStatus(card) {
            Vue.set(card, 'statusId', this.next_status.id);
        }
    },
    computed: {
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
        card: {
            handler: _.debounce(function (card) {
                axios.post('/api/card/update', card);
            }, 1500),
            deep: true
        },
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
        onFieldUpdate(dto) {
            let field = dto.field;
            let value = dto.value;
            if (!this.card.statusData) {
                Vue.set(this.card, 'statusData', {});
            }

            Vue.set(this.card['statusData'], field.id, value);
            console.log(this.card.id, field.id, value);
        },
        onCandidateFieldUpdate(dto) {
            let field = dto.field;
            let value = dto.value;
            Vue.set(this.card, field.id, value);
            console.log('candidate', this.card.id, field.id, value);
        },
        moveToNextStatus() {
            if (!this.next_status) {
                return false;
            }

            this.$emit('move');
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
                field: this.field,
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
    props: ['title', 'items'],
    data() {
        return {
            minimized: false
        }
    },
    methods: {
        updateActiveMenu(newMenuCode) {
            this.items.map(item => {
                item.active = item.code === newMenuCode;
            });
        },
        toggleMinimize() {
            this.minimized = true;
            this.$emit('minimize');
        },
        toggleMaximize() {
            this.minimized = false;
            this.$emit('maximize');
        }
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
        statuses: getTestStatuses(),
        cards: getTestCandidates(),
        activeSettingsStatusId: false,

        loadedUserId: false,
        loadedBoards: false
    },
    methods: {
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
        addNewBoard() {
            let nextBoardNumber = this.boards.length + 1;
            let boardTemplate = {
                title: 'Доска ' + nextBoardNumber,
                userId: this.userId
            };

            return axios.post('/api/board/add', boardTemplate)
                .then(response => {
                    console.log(response);

                    this.statuses = response.data.statuses;
                    this.boards.push(response.data.board);
                    this.cards = [];
                    this.currentBoardId = response.data.board.id;

                })
                .catch(error => {
                    console.log(error);
                });
        },
        deleteCard(card) {
            Vue.set(card, 'statusId', false);
            this.cards.splice(this.cards.indexOf(card), 1);
        },
        async addCard(status) {
            let newCard = {
                statusId: status.id,
                boardId: status.boardId
            };

            let response = await axios.post('/api/card/add', newCard);
            let createdCard = response.data.card;

            this.cards.unshift(createdCard);
        },
        getStatusCards(searchedStatusId) {
            return this.cards.filter(card => card.statusId === searchedStatusId) || [];
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
        }
    },
    asyncComputed: {
        userId: {
            async get() {
                if (this.loadedUserId) {
                    return this.loadedUserId;
                }

                this.loadedUserId = localStorage.getItem('userId') || false;

                if (!this.loadedUserId) {
                    let response = await axios.post('/api/user/add', {});
                    let newUserId = response.data.user.id;

                    this.loadedUserId = newUserId;
                    localStorage.setItem('userId', newUserId);
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
                this.loadedBoards = response.data.boards;
            },
            set(newValue) {
                this.loadedBoards = newValue;
            }
        }
    }
});