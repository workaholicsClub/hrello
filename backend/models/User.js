module.exports = class User {
    constructor(db, fields) {
        this.db = db;
        this.fields = fields;

        if (this.fields['_id']) {
            delete this.fields['_id'];
        }
    }

    asDTO() {
        return Object.assign({}, this.fields);
    }

    static async loadData(db, userId) {
        let dbUsers = db.collection('users');
        return dbUsers.findOne({ id: userId });
    }

    static async makeFromId(db, userId) {
        let userFields = await User.loadData(db, userId);
        return new User(db, userFields);
    }
}