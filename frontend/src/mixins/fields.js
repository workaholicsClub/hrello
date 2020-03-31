import axios from "axios";
import {clone} from "../unsorted/Helpers";
import shortid from "shortid";

export default {
    data() {
        return {
            googleToken: false,
        }
    },
    methods: {
        prepareDefaultContent(cardContent) {
            let preparedDefaultContent = clone(cardContent);

            if (preparedDefaultContent.linkToDefaultById) {
                preparedDefaultContent.id = preparedDefaultContent.linkToDefaultById;
                delete preparedDefaultContent.linkToDefaultById;
            }
            else if (!preparedDefaultContent.id) {
                preparedDefaultContent.id = shortid.generate();
            }

            preparedDefaultContent.date = preparedDefaultContent.date || new Date();
            preparedDefaultContent.author = this.user || preparedDefaultContent.author;

            delete preparedDefaultContent.value;
            delete preparedDefaultContent.valueAuthor;
            delete preparedDefaultContent.valueDate;

            return preparedDefaultContent;
        },
        findLinkedDefaultContent(cardContent) {
            return this.currentBoard.defaultContent.find(defaultContent => defaultContent.id === cardContent.linkToDefaultById)
        },
        async addDefaultContent(cardContent) {
            let newDefaultContent = this.prepareDefaultContent(cardContent);

            if (!this.currentBoard.defaultContent) {
                this.currentBoard.defaultContent = [];
            }

            this.currentBoard.defaultContent.push(newDefaultContent);
            await this.saveCurrentBoard();

            return newDefaultContent;
        },
        async updateDefaultContent(cardContent) {
            if (!cardContent.linkToDefaultById) {
                return;
            }

            let currentDefaultContent = this.findLinkedDefaultContent(cardContent);
            let contentIndex = this.currentBoard.defaultContent.indexOf(currentDefaultContent);

            if (contentIndex === -1) {
                return;
            }

            let updatedDefaultContent = this.prepareDefaultContent(cardContent);
            this.$set(this.currentBoard.defaultContent, contentIndex, updatedDefaultContent);

            await this.saveCurrentBoard();
            return updatedDefaultContent;
        },
        async deleteDefaultContent(cardContent) {
            let currentDefaultContent = this.findLinkedDefaultContent(cardContent);
            let contentIndex = this.currentBoard.defaultContent.indexOf(currentDefaultContent);
            if (contentIndex === -1) {
                return;
            }
            this.currentBoard.defaultContent.splice(contentIndex, 1);
            return this.saveCurrentBoard();
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

                if (localField) {
                    updatedField = localField;
                }

                updatedField.version++;

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
        async uploadFileToOurServer(uploadData) {
            let field = uploadData.field;
            let card = uploadData.card;
            let file = uploadData.file;

            let requestData = new FormData();
            requestData.append('file', file);

            let uploadResult = await axios.post( '/api/file',
                requestData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            let updatedField = field;
            let fieldIndex = card.content.reduce( (acc, searchField, index) => field.id === searchField.id ? index : acc, -1);

            updatedField.version++;

            updatedField.file = {
                name: file.name,
                type: file.type
            };

            updatedField.uploadData = {
                fileId: uploadResult.data.fileId,
                downloadUrl: uploadResult.data.relativeUrl,
                fileAuthor: this.user,
                fileDate: new Date()
            };

            card.content[fieldIndex] = updatedField;
            await this.saveCard(card);

            this.cardRedrawIndex++;
        },
        async uploadFile(uploadData) {
            if (this.useGoogleServices) {
                this.uploadFileGoogleDrive(uploadData);
            }
            else {
                this.uploadFileToOurServer(uploadData);
            }
        },
        async getGoogleToken() {
            return this.user
                ? this.$gapi._libraryInit('client')
                    .then(client => {
                        this.googleToken = client.getToken().access_token;
                    })
                : null;
        },

        async startRecordEdit(record) {
            record.isEditing = true;
            this.cardRedrawIndex++;
        },
        async stopRecordEdit(record) {
            record.isEditing = false;
            this.cardRedrawIndex++;
        }
    },
    mounted() {
        this.$root.$on('startRecordEdit', this.startRecordEdit);
        this.$root.$on('stopRecordEdit', this.stopRecordEdit);
        this.$root.$on('updateFieldsOrder', this.updateFieldsOrder);
        this.$root.$on('fileUpload', this.uploadFile);
    },
    beforeDestroy() {
        this.$root.$off('startRecordEdit', this.startRecordEdit);
        this.$root.$off('stopRecordEdit', this.stopRecordEdit);
        this.$root.$off('updateFieldsOrder', this.updateFieldsOrder);
        this.$root.$off('fileUpload', this.uploadFile);
    }
}