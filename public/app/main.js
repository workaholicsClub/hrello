function getRandom(array, count) {
    let records = [];

    for (let index = 1; index <= count; index++) {
        let randomIndex = Math.round(Math.random()*(array.length-1));
        records.push(array[randomIndex]);
    }

    return records;
}
function getTestStatuses() {
    let allCandidates = [
        {id: 1, name: 'Николюк Остап', position: '1С Программист'},
        {id: 2, name: 'Ярков Антон', position: 'Аналитик'},
        {id: 3, name: 'Сапалёв Виктор', position: '1С Программист'},
        {id: 4, name: 'Караваев Эдуард', position: 'Помощник бухгалтера'},
        {id: 5, name: 'Кулигин Степан', position: 'Стажер'},
        {id: 6, name: 'Уманов Константин', position: 'Стажер'},
        {id: 7, name: 'Звягин Захар', comment: 'Настойчив'},
        {id: 8, name: 'Ярославцев Иван', position: 'Стажер'},
        {id: 9, name: 'Ошурков Павел', position: 'Бухгалтер'},
        {id: 10, name: 'Ячменцев Тарас', position: 'Стажер'},
        {id: 11, name: 'Бабкина Елена', comment: 'Вторая попытка'},
        {id: 12, name: 'Кривова Ника', position: 'Аналитик'},
        {id: 13, name: 'Репина Дарья', position: '1С Программист'},
        {id: 14, name: 'Веретёнова Виктория', comment: 'Нужно уточнить про паспорт'},
        {id: 15, name: 'Курдина Яна', position: 'Стажер'},
        {id: 16, name: 'Ерофеева Ирина', position: 'Помощник бухгалтера'},
        {id: 17, name: 'Чекудаева Лидия', position: 'Помощник бухгалтера'},
        {id: 18, name: 'Ковпак Вера', position: 'Бухгалтер'},
        {id: 19, name: 'Кравец Регина', position: 'Бухгалтер'},
        {id: 20, name: 'Гнусарева Анна', position: 'Аналитик'}
    ];
    let testStatuses = [
        {
            id: 1,
            title: 'Входящие',
            cards: getRandom(allCandidates, 6)
        },
        {
            id: 2,
            title: 'Интервью',
            fields: [
                {'title': 'Телефонное интервью', 'type': 'checkbox', 'code': 'i0', sort: 1},
                {'title': 'Тестирование', 'type': 'checkbox', 'code': 'i1', sort: 2}
            ],
            cards: getRandom(allCandidates, 4)
        },
        {
            id: 3,
            title: 'Собеседование',
            fields: [
                {'title': 'HR', 'type': 'color', 'code': 'i2', sort: 1},
                {'title': 'Дата команды', 'type': 'datetime', 'code': 'i21', sort: 2},
                {'title': 'С командой', 'type': 'color', 'code': 'i3', sort: 3}
            ],
            cards: getRandom(allCandidates, 3)
        },
        {
            id: 4,
            title: 'Оффер',
            fields: [
                {'title': 'Подтверждение руководителем', 'type': 'color', 'code': 'i4', sort: 1},
                {'title': 'Проверка СБ', 'type': 'color', 'code': 'i5', sort: 2},
                {'title': 'Подтверждение кандидатом', 'type': 'checkbox', 'code': 'i6', sort: 3},
                {'title': 'Оповещение группы', 'type': 'checkbox', 'code': 'i7', sort: 4}
            ],
            cards: getRandom(allCandidates, 2)
        },
        {
            id: 5,
            title: 'Выход на работу',
            fields: [
                {'title': 'Дата выхода', 'type': 'date', 'code': 'i8', sort: 1},
                {'title': 'Документы кандидата', 'type': 'checkbox', 'code': 'i9', sort: 2},
                {'title': '«Buddy»', 'type': 'text', 'code': 'i10', sort: 3},
                {'title': 'Выход', 'type': 'checkbox', 'code': 'i12', sort: 4}
            ],
            cards: getRandom(allCandidates, 1)
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
            this.cards.splice(this.cards.indexOf(card), 1);
        },
        addCardToNextStatus(card) {
            this.next_status_cards.unshift(card);
        },
        addNewCard() {
            this.cards.unshift({});
        },
        moveCardToNextStatus(card) {
            this.deleteCard(card);
            this.addCardToNextStatus(card);
        }
    },
    computed: {
        cardsCount() {
            return this.cards ? this.cards.length : 0;
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
            Vue.set(this.card, field.code, value);
            console.log(this.card.id, field.code, value);
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
                let currentValueDefined = typeof (this.card[currentField.code]) !== 'undefined';
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

            return this.card[this.activeField.code];
        },
        isCompleted() {
            if (!this.fields) {
                return true;
            }

            let lastField = this.fields[ this.fields.length - 1 ];
            let isLastField = this.activeField.code === lastField.code;
            let hasValue = typeof (this.card[lastField.code]) != 'undefined';
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
        boards: [
            {id: '5d1f63f55f725d8d26ef3e13', title: 'Доска 1'}
        ],
        statuses: getTestStatuses()
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

            let localStatus = this.statuses.reduce((found, current) => {
                if (current.id == remoteStatus.id) {
                    return current;
                }

                return found;
            }, false);

            if (localStatus) {
                Vue.set(localStatus, 'cards', cards);
            }
        },
        getCandidateFields() {
            return [
                {'title': 'Полное имя', 'type': 'text', 'code': 'name', sort: 1},
                {'title': 'Должность', 'type': 'text', 'code': 'position', sort: 2},
                {'title': 'Почта', 'type': 'text', 'code': 'email', sort: 3},
                {'title': 'Телефон', 'type': 'text', 'code': 'phone', sort: 4},
                {'title': 'Ссылка на резюме', 'type': 'text', 'code': 'resumeUrl', sort: 5},
                {'title': 'Вуз', 'type': 'text', 'code': 'university', sort: 6},
                {'title': 'Комментарий', 'type': 'longtext', 'code': 'comment', sort: 7},
            ];
        }
    },
    computed: {
        title() {
            return this.menuItems[0].title;
        },
        menuItems() {
            let menuItems = this.boards.map(board => {
                return {
                    code: board.id,
                    title: board.title,
                    active: false
                };
            });
            menuItems[0].active = true;
            return menuItems;
        }
    }
});