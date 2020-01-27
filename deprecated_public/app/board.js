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
function getCardFieldValue(field, card) {
    if (!field) {
        return undefined;
    }

    let hasValue =
        typeof (card['statusData']) != 'undefined' &&
        typeof (card.statusData[field.id]) != 'undefined';

    return hasValue ? card.statusData[field.id] : undefined;
}
function getCardFieldPluginData(card, pluginId, fieldId) {
    if (!card['pluginData']) {
        return undefined;
    }

    if (!card['pluginData'][pluginId]) {
        return undefined;
    }

    return card['pluginData'][pluginId][fieldId];
}
function clone(object) {
    return JSON.parse(JSON.stringify(object));
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
        fileUpload(uploadData) {
            uploadData.status = this.status;
            this.$emit('upload', uploadData);
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
        },
        onCalendar(cardFieldData) {
            cardFieldData.status = this.status;
            this.$emit('calendar', cardFieldData);
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
        onFileUpload(fieldData) {
            this.$emit('upload', {
                card: this.card,
                field: fieldData.field,
                file: fieldData.file,
                isWorkflowField: true
            });
        },
        onCalendar(field) {
            this.$emit('calendar', {
                card: this.card,
                field: field
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
        onCandidateFileUpload(fieldData) {
            this.$emit('upload', {
                card: this.card,
                field: fieldData.field,
                file: fieldData.file,
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
            return getCardFieldValue(field, this.card);
        },
        getFieldPluginData(field) {
            return getCardFieldPluginData(this.card, 'calendar', field.id);
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
    props: ['field', 'value', 'onlyValue', 'is_inline', 'plugin-data'],
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
        addCalendarEvent(field) {
            this.$emit('calendar', field);
        },
        saveFile() {
            let input = this.$refs.fileInput;
            this.$emit('upload', {
                field: this.field,
                file: input.files[0]
            });
        }
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
        },
        calendarEventId() {
            return this.pluginData ? this.pluginData.id : false;
        },
        hasCalendarEvent() {
            return Boolean(this.calendarEventId) !== false;
        }
    },
    watch: {
        value() {
            this.savedValue = this.value;
            this.isEditing = false;
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
    props: ['title', 'items', 'is-authorized', 'user', 'google-sign-in-params', 'google-authorized'],
    data() {
        return {
            minimized: false,
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
            this.$emit('authorized', googleUser);
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

let hrelloInstance = new Vue({
    el: '#board',
    data: {
        dragStartPosition: false,
        dragStartElLeft: false,
        currentBoardId: false,
        currentCardId: false,
        statuses: [],
        cards: [],
        activeSettingsStatusId: false,
        dragCard: false,

        user: false,
        loadedUserId: false,
        loadedBoards: false,

        plugins: [],

        clientCredentials: {
            apiKey: 'AIzaSyBIY2q5KrLo7I-W8iREDq2zeqnfq3Xno0Y',
            discoveryDocs: [
                "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
            ],
        },
        calendarId: 'primary',
        calendarCredentials: {
            client_id: '401657247398-upt85a2i2spf4f61sfff5g6405cus68m.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive'
        },
        calendarAuthData: false
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
        async updatePluginData(card, pluginId, fieldId, value) {
            if (!card.pluginData) {
                Vue.set(card, 'pluginData', {});
            }

            if (!card.pluginData[pluginId]) {
                Vue.set(card['pluginData'], pluginId, {});
            }

            Vue.set(card['pluginData'][pluginId], fieldId, value);
        },
        getPluginData(card, pluginId, fieldId) {
            return getCardFieldPluginData(card, pluginId, fieldId);
        },
        getStatusById(searchId) {
            return this.statuses.reduce((found, currentStatus) => {
                if (currentStatus.id === searchId) {
                    return currentStatus;
                }

                return found;
            }, false);
        },
        getStatusFieldById(status, searchId) {
            return status.fields.reduce((found, currentField) => {
                if (currentField.id === searchId) {
                    return currentField;
                }
                return found;
            }, false);
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

                    let status = this.getStatusById(card.statusId);
                    let field = this.getStatusFieldById(status, updateData.fieldId);
                    let isDateTimeField = field.type === 'date' || field.type === 'datetime';
                    let hasEvent = Boolean(this.getPluginData(card, 'calendar', updateData.fieldId));
                    let canUpdateCalendar = isDateTimeField && hasEvent && this.calendarAuthorized;

                    if (canUpdateCalendar) {
                        let eventSource = {
                            card: card,
                            field: field
                        };

                        this.addOrUpdateCalendarEvent(eventSource);
                    }
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
                this.saveCard(card);
            }
        },
        async saveCard(card) {
            return axios.post('/api/card/update', card);
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
        authCalendar() {
            let ensureSignInPromise = Promise.resolve(gapi.auth2.getAuthInstance().signIn());
            ensureSignInPromise.then((googleUser) => {
                this.onAuthResult(googleUser);
            });
        },
        onAuthResult(googleUser) {
            this.calendarAuthData = googleUser;
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
                {'title': 'Резюме', 'type': 'file', 'id': 'resume', sort: 5},
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
        getGoogleUserProfile(googleUser) {
            let googleProfile = googleUser.getBasicProfile();

            let user = {
                googleId: googleProfile.getId(),
                fullName: googleProfile.getName(),
                firstName: googleProfile.getGivenName(),
                familyName: googleProfile.getFamilyName(),
                imageUrl: googleProfile.getImageUrl(),
                email: googleProfile.getEmail()
            };

            return user;
        },

        async login(googleUser) {
            let profile = this.getGoogleUserProfile(googleUser);
            let response = await axios.post('/api/user/login', profile);
            this.user = response.data.user;
            localStorage.setItem('authorizedUser', JSON.stringify(this.user));

            this.resetBoards();
        },
        logout() {
            this.user = false;
            localStorage.removeItem('authorizedUser');

            this.resetBoards();
        },
        readGoogleUserFromGAPI() {
            let googleUser = gapi.auth2.getAuthInstance().currentUser.get();
            this.onAuthResult(googleUser);
        },
        setupGapi() {
            gapi.load('client:auth2', () => {
                gapi.client.init(this.clientCredentials)
                    .catch((error) => console.log(error));

                gapi.auth2.init(this.calendarCredentials)
                    .then(() => {
                        let authInstance = gapi.auth2.getAuthInstance();
                        let signInStatus = authInstance.isSignedIn.get();
                        if (signInStatus === true) {
                            this.readGoogleUserFromGAPI();
                        }

                        authInstance.isSignedIn.listen(
                            (isSignedIn) => {
                                if (isSignedIn) {
                                    this.readGoogleUserFromGAPI();
                                }
                                else {
                                    this.calendarAuthData = false;
                                }
                            }
                        );
                    })
                    .catch((error) => console.log(error));
            });
        },
        addEvent(title, start, end, card) {
            let event = {
                'summary': title,
                'start': {
                    'dateTime': start.toISOString()
                },
                'end': {
                    'dateTime': end.toISOString()
                },
            };

            let gapiRequest = gapi.client.calendar.events.insert({
                'calendarId': this.calendarId,
                'resource': event
            });

            return new Promise(resolve => gapiRequest.execute(resolve) );
        },
        updateEvent(event, title, newStart, newEnd) {
            let newEvent = {
                'summary': title,
                'start': {
                    'dateTime': newStart.toISOString()
                },
                'end': {
                    'dateTime': newEnd.toISOString()
                },
            };

            let gapiRequest = gapi.client.calendar.events.update({
                'calendarId': this.calendarId,
                'eventId': event.id,
                'resource': newEvent
            });

            return new Promise(resolve => gapiRequest.execute(resolve) );
        },
        async getFolderIdOrMake(folderName, parentFolderId) {
            let folderQuery = "name = '" + folderName + "' and mimeType = 'application/vnd.google-apps.folder'";
            if (parentFolderId) {
                folderQuery += " and '" + parentFolderId + "' in parents";
            }

            let searchRequest = gapi.client.drive.files.list({
                q: folderQuery,
                fields: 'files(id)',
                spaces: 'drive'
            });

            let searchResponse = await new Promise(resolve => searchRequest.execute(resolve) );
            let foundFolders = searchResponse.files;
            let foundFolder = foundFolders.length > 0 ? foundFolders[0] : false;

            if (foundFolder) {
                return foundFolder.id
            }

            let folderMetadata = {
                'name': folderName,
                'mimeType': 'application/vnd.google-apps.folder'
            };

            if (parentFolderId) {
                folderMetadata['parents'] = [parentFolderId];
            }

            let addRequest = gapi.client.drive.files.create({
                resource: folderMetadata,
                fields: 'id'
            });

            let addResponse = await new Promise(resolve => addRequest.execute(resolve) );

            return addResponse.id ? addResponse.id : false;
        },
        async uploadFileGoogleDrive(uploadData) {
            let field = uploadData.field;
            let card = uploadData.card;
            let file = uploadData.file;

            let rootFolderId = await this.getFolderIdOrMake('HRello');
            let fieldFolderId = await this.getFolderIdOrMake(field.title, rootFolderId);

            let metadata = {
                'name': file.name,
                'mimeType': file.type,
                'parents': [fieldFolderId],
            };

            let accessToken = gapi.auth.getToken().access_token;
            let requestData = new FormData();
            requestData.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
            requestData.append('file', file);

            let request = new XMLHttpRequest();
            let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
            request.open('post', uploadUrl);
            request.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            request.responseType = 'json';
            request.onload = () => {
                let driveFile = request.response;
                let downloadUrl = 'https://drive.google.com/uc?export=download&id='+driveFile.id;
                let updateData = uploadData;
                updateData.fieldId = field.id;
                updateData.value = downloadUrl;

                this.updatePluginData(card, 'drive', field.id, driveFile);
                this.updateCard(updateData);
            };
            request.send(requestData);
        },
        addOrUpdateCalendarEvent(eventSource) {
            let canUseCalendar = this.calendarAuthorized;
            if (!canUseCalendar) {
                return this.authCalendar();
            }

            let field = eventSource.field;
            let card = eventSource.card;
            let savedData = this.getPluginData(card, 'calendar', field.id);
            let eventExists = Boolean(savedData);
            let hour = 60 * 60 * 1000;
            let isDateField = field.type === 'datetime' || field.type === 'date';
            let fieldValue = getCardFieldValue(field, card);
            let hasValue = Boolean(fieldValue);

            let start = isDateField && hasValue? new Date( fieldValue ) : new Date();
            let end = new Date();
            end.setTime( start.getTime() + hour );

            let candidateName = card.name;
            let actionName = field.title;
            let eventTitle = `${actionName}: ${candidateName}`;

            if (eventExists) {
                this.updateEvent( savedData, eventTitle, start, end ).then((updatedEvent) => {
                    this.updatePluginData(card, 'calendar', field.id, updatedEvent);
                    this.saveCard(card);
                });
            }
            else {
                this.addEvent( eventTitle, start, end ).then((createdEvent) => {
                    this.updatePluginData(card, 'calendar', field.id, createdEvent);
                    this.saveCard(card);
                });
            }
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
        },
        calendarAuthorized() {
            return this.calendarAuthData !== false;
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
        this.setupGapi();
        this.loadUrlData();
        this.loadLocalData();
    }
});