import axios from "axios";
import {getGlobalFieldData} from "../unsorted/Helpers";

export default {
    data() {
        return {
            globalFields: [],
            googleToken: false,
        }
    },
    methods: {
        async loadGlobalFields() {
            this.globalFields = await this.loadGlobalObject('field');
        },
        findGlobalField(fieldId) {
            let foundFields = this.globalFields.filter(field => field.id === fieldId);
            return foundFields.length > 0 ? foundFields[0] : false;
        },
        findGlobalValueIndex(fieldId, card) {
            if (!card.globalValues) {
                return -1;
            }

            return card.globalValues.reduce( (foundIndex, valueData, currentIndex) => {
                if (valueData.fieldId === fieldId) {
                    return currentIndex;
                }

                return foundIndex;
            }, -1);
        },
        async addGlobalField(newField) {
            newField.date = new Date();
            newField.author = this.user;

            if (this.user) {
                newField.userId = this.user.id;
            }

            if (this.currentBoard) {
                newField.boardId = this.currentBoard.id;
            }

            let response = await axios.post('/api/field/addGlobal', newField);
            this.globalFields = response.data.fields;

            return response;
        },
        async updateGlobalValue(newValue, content, card) {
            let fieldId = content.id;
            let valueIndex = this.findGlobalValueIndex(fieldId, card);

            let newValueData = {
                fieldId: fieldId,
                type: content.type,
                name: content.name,
                value: newValue,
                valueAuthor: this.user,
                valueDate: new Date()
            };

            if (!card.globalValues) {
                card.globalValues = [];
            }

            if (valueIndex === -1) {
                card.globalValues.push(newValueData);
            }
            else {
                card.globalValues[valueIndex] = newValueData;
            }

            return this.saveCard(card);
        },
        async updateGlobalField(newValue, newField, oldField, card) {
            let fieldIndex = this.globalFields.indexOf(oldField);

            if (fieldIndex === -1) {
                return;
            }

            this.$set(this.globalFields, fieldIndex, newField);

            await axios.post('/api/field/updateGlobal', newField);
            return await this.updateGlobalValue(newValue, newField, card);
        },

        async updateFieldsOrder(sortedContent, card) {
            card.content = sortedContent;
            this.saveCard(card);
        },

        urlParams(data) {
            return Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&');
        },
        async getFolderIdOrMake(folderName, parentFolderId) {
            let folderQuery = "name = '" + folderName + "' and mimeType = 'application/vnd.google-apps.folder'";
            if (parentFolderId) {
                folderQuery += " and '" + parentFolderId + "' in parents";
            }

            let searchResponse = await this.$gapi.request({
                path: 'https://www.googleapis.com/drive/v3/files',
                method: 'GET',
                params: {
                    q: folderQuery,
                    fields: 'files(id)',
                    spaces: 'drive'
                }
            });

            let foundFolders = searchResponse.result.files;
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

            let addResponse = await this.$gapi.request({
                path: 'https://www.googleapis.com/drive/v3/files',
                method: 'POST',
                params: {
                    fields: 'id'
                },
                body: JSON.stringify(folderMetadata)
            });

            return addResponse.result.id ? addResponse.result.id : false;
        },
        async uploadFileGoogleDrive(uploadData) {
            let field = uploadData.field;
            let localField = uploadData.localField;
            let card = uploadData.card;
            let file = uploadData.file;

            if (!file) {
                return;
            }

            let rootFolderId = await this.getFolderIdOrMake('HRello');
            let fieldFolderId = await this.getFolderIdOrMake(field.name, rootFolderId);

            let metadata = {
                'name': file.name,
                'mimeType': file.type,
                'parents': [fieldFolderId],
            };

            let accessToken = this.googleToken;
            let requestData = new FormData();
            requestData.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
            requestData.append('file', file);

            let request = new XMLHttpRequest();
            let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
            request.open('post', uploadUrl);
            request.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            request.responseType = 'json';
            request.onload = async () => {
                let driveFile = request.response;
                let downloadUrl = 'https://drive.google.com/uc?export=download&id='+driveFile.id;

                let updatedField = field;

                if (field.isGlobal) {
                    if (localField) {
                        updatedField = localField;
                    }
                    else {
                        await this.updateGlobalValue(null, field, card);
                        updatedField = getGlobalFieldData(field.id, card);
                    }
                }

                updatedField.file = {
                    name: file.name,
                    type: file.type
                };

                updatedField.googleDrive = {
                    rootFolderId: rootFolderId,
                    fieldFolderId: fieldFolderId,
                    fileId: driveFile.id,
                    downloadUrl: downloadUrl,
                    fileAuthor: this.user,
                    fileDate: new Date()
                };

                this.saveCard(card);

                this.cardRedrawIndex++;
            };
            request.send(requestData);
        },
        async getGoogleToken() {
            return this.user
                ? this.$gapi._libraryInit('client')
                    .then(client => {
                        this.googleToken = client.getToken().access_token;
                    })
                : null;
        }
    },
    mounted() {
        this.$root.$on('updateGlobalField', this.updateGlobalField);
        this.$root.$on('updateGlobalFieldValue', this.updateGlobalValue);

        this.$root.$on('newGlobalField', this.addGlobalField);
        this.$root.$on('updateFieldsOrder', this.updateFieldsOrder);
        this.$root.$on('fileUpload', this.uploadFileGoogleDrive);
    },
    beforeDestroy() {
        this.$root.$off('updateGlobalField', this.updateGlobalField);
        this.$root.$off('updateGlobalFieldValue', this.updateGlobalValue);

        this.$root.$off('newGlobalField', this.addGlobalField);
        this.$root.$off('updateFieldsOrder', this.updateFieldsOrder);
        this.$root.$off('fileUpload', this.uploadFileGoogleDrive);
    }
}