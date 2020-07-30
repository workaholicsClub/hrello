const shortid = require('shortid');
const Board = require('../models/Board');
const User = require('../models/User');

module.exports = class CandidateCard {
    constructor(db, fields, board, user) {
        this.db = db;
        this.fields = fields;
        this.board = board;
        this.user = user;
        this.isNew = true;

        if (this.fields['_id']) {
            this.isNew = false;
            delete this.fields['_id'];
        }
    }

    setPinnedFieldValue(fieldName, value) {
        if (!this.fields.pinnedFieldValues) {
            this.fields.pinnedFieldValues = [];
        }

        let pinnedField = this.board.getPinnedFieldByName(fieldName);
        if (!pinnedField) {
            return false;
        }

        let currentValue = this.fields.pinnedFieldValues.find(value => value.fieldId === pinnedField.id );
        if (currentValue) {
            let valueIndex = this.fields.pinnedFieldValues.indexOf(currentValue);
            let newValue = Object.assign(currentValue, value);
            this.fields.pinnedFieldValues[valueIndex] = newValue;
        }
        else {
            let defaultValue = {
                fieldId: pinnedField.id,
                fieldName: pinnedField.name
            }

            if (this.user) {
                defaultValue['author'] = this.user.asDTO();
            }

            let newValue = Object.assign(defaultValue, value);
            this.fields.pinnedFieldValues.push(newValue);
        }
    }

    getPinnedFieldValue(searchFieldName) {
        if (!this.fields.pinnedFieldValues) {
            return null;
        }

        return this.fields.pinnedFieldValues.find( field => field.fieldName === searchFieldName );
    }

    getPinnedFieldsWithValues() {
        return this.board.getPinnedFields().map( boardField => {
            let value = this.getPinnedFieldValue( boardField.name );
            if (value) {
                return Object.assign(boardField, value);
            }
            else {
                return Object.assign(boardField, {value: null});
            }
        }).filter(field => field.value && field.value !== null);
    }

    addCandidateFieldValues(candidate) {
        if (candidate.name) {
            this.fields.name = candidate.name();
        }

        for (const field of candidate.getCardFields()) {
            this.setPinnedFieldValue(field.name,  {value: field.value});
        }
    }

    addFileField(name, path, type, id, extraData) {
        let fileField = {
            type: 'field',
            fieldType: 'file',
            file: {name, type},
            date: (new Date()).toISOString(),
            uploadData: {
                fileId: id,
                downloadUrl: '/uploads/'+name,
                fileAuthor: this.user.asDTO(),
                fileDate: (new Date()).toISOString()
            }
        }

        fileField = Object.assign(fileField, extraData);

        return this.addField(fileField);
    }

    addField(data) {
        if (!this.fields.content) {
            this.fields.content = [];
        }

        let field = Object.assign({
            id: shortid.generate(),
            author: this.user.asDTO(),
        }, data);
        this.fields.content.push(field);
        return field;
    }

    getFiles() {
        //let pinnedFiles = this.getPinnedFieldsWithValues().filter(field => field.fieldType === 'file');
        let contentFiles = this.fields.content
            ? this.fields.content
                .filter( content => content.fieldType === 'file' || typeof (content.file) !== 'undefined')
                .map(content => {
                    let file = content.file;
                    file.fileName = content.uploadData.downloadUrl.replace(/^.*\//, '');
                    return file;
                })
            : [];
        let commentFiles = this.fields.content
            ? this.fields.content
                .filter( content => content.fieldType === 'smartComment' )
                .reduce((files, comment) => {
                    return comment.data && comment.data.files ? files.concat(comment.data.files) : files;
                }, [])
                .map(file => {
                    file.name = file.fileName;
                    file.fileName = file.url.replace(/^.*\//, '');
                    return file;
                })
            : [];

        return contentFiles.concat(commentFiles);
    }

    async save() {
        let dbCards = this.db.collection('cards');
        if (this.isNew) {
            return dbCards.insertOne(this.fields);
        }
        else {
            return dbCards.findOneAndReplace({id: this.fields.id}, this.fields);
        }
    }

    asDTO() {
        return Object.assign({}, this.fields);
    }

    static async makeNewForBoard(db, board, user) {
        let startingStatus = await board.getStartingStatus();

        let cardTemplate = {
            id: shortid.generate(),
            boardId: board.id,
            statusId: startingStatus.id
        }

        if (user) {
            cardTemplate['user'] = user.asDTO();
        }

        return new CandidateCard(db, cardTemplate, board, user);
    }

    static makeFromFields(db, cardFields, boardFields, userFields) {
        let board = new Board(db, boardFields);
        let user = new User(db, userFields);

        return new CandidateCard(db, cardFields, board, user);
    }

    static async loadData(db, cardId) {
        let dbCards = db.collection('cards');
        let card = await dbCards.findOne({id: cardId});
        return card;
    }

    static async makeFromId(db, cardId) {
        let cardFields = await CandidateCard.loadData(db, cardId)
        let user = cardFields.user ? new User(db, cardFields.user) : false;
        let board = cardFields.boardId ? await Board.makeFromId(db, cardFields.boardId) : false;


        return new CandidateCard(db, cardFields, board, user);
    }
}