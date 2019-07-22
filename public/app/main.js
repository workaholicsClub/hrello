function getRandom(array, count) {
    let records = [];

    for (let index = 1; index <= count; index++) {
        let randomIndex = Math.round(Math.random()*(array.length-1));
        records.push(array[randomIndex]);
    }

    return records;
}
function getTestCandidates() {
    return {
        1: [
            {id: 1, name: 'Николюк Остап', position: '1С Программист'},
            {id: 2, name: 'Ярков Антон', position: 'Аналитик'},
            {id: 3, name: 'Сапалёв Виктор', position: '1С Программист'},
            {id: 4, name: 'Караваев Эдуард', position: 'Помощник бухгалтера'},
            {id: 5, name: 'Кулигин Степан', position: 'Стажер'},
            {id: 6, name: 'Уманов Константин', position: 'Стажер'}
        ],
        2: [
            {id: 7, name: 'Звягин Захар', comment: 'Настойчив'},
            {id: 8, name: 'Ярославцев Иван', position: 'Стажер'},
            {id: 9, name: 'Ошурков Павел', position: 'Бухгалтер'},
            {id: 10, name: 'Ячменцев Тарас', position: 'Стажер'}
        ],
        3: [
            {id: 11, name: 'Бабкина Елена', comment: 'Вторая попытка'},
            {id: 12, name: 'Кривова Ника', position: 'Аналитик'},
            {id: 13, name: 'Репина Дарья', position: '1С Программист'},
        ],
        4: [
            {id: 14, name: 'Веретёнова Виктория', comment: 'Нужно уточнить про паспорт'},
            {id: 15, name: 'Курдина Яна', position: 'Стажер'},
        ],
        5: [
            {id: 16, name: 'Ерофеева Ирина', position: 'Помощник бухгалтера'},
            {id: 17, name: 'Чекудаева Лидия', position: 'Помощник бухгалтера'},
            {id: 18, name: 'Ковпак Вера', position: 'Бухгалтер'},
            {id: 19, name: 'Кравец Регина', position: 'Бухгалтер'},
            {id: 20, name: 'Гнусарева Анна', position: 'Аналитик'}
        ]
    };
}
function getTestStatuses() {
    let testStatuses = [
        {
            id: 1,
            title: 'Входящие',
            fields: []
        },
        {
            id: 2,
            title: 'Интервью',
            fields: [
                {'title': 'Телефонное интервью', 'type': 'checkbox', 'id': 'i0', sort: 1},
                {'title': 'Тестирование', 'type': 'checkbox', 'id': 'i1', sort: 2}
            ]
        },
        {
            id: 3,
            title: 'Собеседование',
            fields: [
                {'title': 'HR', 'type': 'color', 'id': 'i2', sort: 1},
                {'title': 'Дата команды', 'type': 'datetime', 'id': 'i21', sort: 2},
                {'title': 'С командой', 'type': 'color', 'id': 'i3', sort: 3}
            ]
        },
        {
            id: 4,
            title: 'Оффер',
            fields: [
                {'title': 'Подтверждение руководителем', 'type': 'color', 'id': 'i4', sort: 1},
                {'title': 'Проверка СБ', 'type': 'color', 'id': 'i5', sort: 2},
                {'title': 'Подтверждение кандидатом', 'type': 'checkbox', 'id': 'i6', sort: 3},
                {'title': 'Оповещение группы', 'type': 'checkbox', 'id': 'i7', sort: 4}
            ]
        },
        {
            id: 5,
            title: 'Выход на работу',
            fields: [
                {'title': 'Дата выхода', 'type': 'date', 'id': 'i8', sort: 1},
                {'title': 'Документы кандидата', 'type': 'checkbox', 'id': 'i9', sort: 2},
                {'title': '«Buddy»', 'type': 'text', 'id': 'i10', sort: 3},
                {'title': 'Выход', 'type': 'checkbox', 'id': 'i12', sort: 4}
            ]
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
        currentCards: function () {
            this.$emit('cards_changed', {
                status: this.status,
                cards: this.currentCards
            });
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
        deleteCard(card) {
            this.currentCards.splice(this.currentCards.indexOf(card), 1);
        },
        addCardToNextStatus(card) {
            let newNextStatusCards = this.next_status_cards;
            newNextStatusCards.unshift(card);

            this.$emit('cards_changed', {
                status: this.next_status,
                cards: newNextStatusCards
            });
        },
        addNewCard() {
            this.currentCards.unshift({});
        },
        moveCardToNextStatus(card) {
            this.deleteCard(card);
            this.addCardToNextStatus(card);
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
            Vue.set(this.card, field.id, value);
            console.log(this.card.id, field.id, value);
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
        }
    },
    computed: {
        activeField() {
            if (!this.fields) {
                return false;
            }

            let lastFieldWithData = this.fields.reduce((foundField, currentField) => {
                let currentValueDefined = typeof (this.card[currentField.id]) !== 'undefined';
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

            return this.card[this.activeField.id];
        },
        isCompleted() {
            if (!this.fields || this.fields.length === 0) {
                return true;
            }

            let lastField = this.fields[ this.fields.length - 1 ];
            let isLastField = this.activeField.id === lastField.id;
            let hasValue = typeof (this.card[lastField.id]) != 'undefined';
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
            return typeof (this.value) != 'undefined';
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
        /*boards: [
            {id: '5d1f63f55f725d8d26ef3e13', title: 'Доска 1'},
        ],*/
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
        replaceCards(dto) {
            let remoteStatus = dto.status;
            let cards = dto.cards;

            Vue.set(this.cards, remoteStatus.id, cards);
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
                    this.cards = {};
                    this.currentBoardId = response.data.board.id;

                })
                .catch(error => {
                    console.log(error);
                });
        },
        getStatusCards(statusId) {
            return this.cards[statusId] || [];
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