const shortid = require('shortid');

module.exports = class Board {
    constructor(db, fields) {
        this.db = db;
        this.fields = fields;

        if (this.fields['_id']) {
            delete this.fields['_id'];
        }
    }

    get id() {
        return this.fields.id || false;
    }

    getSkills() {
        return this.fields.skills && this.fields.skills.length > 0
            ? this.fields.skills
            : [];
    }

    getPinnedFieldByName(fieldName) {
        let hasPinnedFields = this.fields.pinnedFields && this.fields.pinnedFields.length > 0;

        return hasPinnedFields
            ? this.fields.pinnedFields.find(field => field.name === fieldName )
            : false;
    }

    getPinnedFields() {
        let hasPinnedFields = this.fields.pinnedFields && this.fields.pinnedFields.length > 0;
        return hasPinnedFields
            ? this.fields.pinnedFields.slice()
            : [];
    }

    async getStatuses() {
        if (this.fields.statuses) {
            return this.fields.statuses;
        }

        if (this.loadedStatuses) {
            return this.loadedStatuses;
        }

        let dbStatuses = this.db.collection('statuses');
        this.loadedStatuses = dbStatuses
            .find({
                boardId: this.fields.id,
                archive: {$in: [null, false]},
                deleted: {$in: [null, false]},
            })
            .sort({sort: 1})
            .toArray();

        return this.loadedStatuses;
    }

    async getStartingStatus() {
        let statuses = await this.getStatuses();
        return statuses[0];
    }

    addPinnedField(fieldName, fieldType, user) {
        if (!this.fields.pinnedFields) {
            this.fields.pinnedFields = [];
        }

        let field = {
            id: shortid.generate(),
            name: fieldName,
            type: 'field',
            fieldType,
            showOnCard: true,
            autoAdded: true,
            date: (new Date).toISOString(),
        }

        if (user) {
            field['author'] = user;
        }

        this.fields.pinnedFields.push(field);

        return field;
    }

    hasPinnedField(fieldName) {
        let field = this.getPinnedFieldByName(fieldName);
        return Boolean(field);
    }

    addMissingCandidatePinnedFields(candidate) {
        let candidateFields = candidate.getCardFields();
        for (const field of candidateFields) {
            if (!this.hasPinnedField(field.name)) {
                let fieldType = field.fieldType || 'text';
                this.addPinnedField(field.name, fieldType, this.user);
            }
        }
    }

    async asDTO() {
        let statuses = this.fields.statuses
            ? this.fields.statuses
            : await this.getStatuses();

        return Object.assign({}, this.fields, {statuses});
    }

    async save() {
        let dbBoards = this.db.collection('boards');
        await dbBoards.findOneAndReplace({id: this.id}, this.fields);
    }

    static async loadData(db, boardId) {
        let dbBoards = db.collection('boards');
        let board = await dbBoards.findOne({id: boardId});
        return board;
    }

    static async makeFromId(db, boardId) {
        let boardFields = await Board.loadData(db, boardId)
        return new Board(db, boardFields);
    }
}