'use strict';

const express = require('express');
const fileupload = require('express-fileupload')
const shortid = require('shortid');
const MongoClient = require('mongodb').MongoClient;

const boardRoutes = require('./routes/board');
const userRoutes = require('./routes/user');
const cardRoutes = require('./routes/card');
const statusRoutes = require('./routes/status');
const eventRoutes = require('./routes/event');
const fieldRoutes = require('./routes/field');
const fileRoutes = require('./routes/file');
const inviteRoutes = require('./routes/invite');

const PORT = 3000;
const HOST = '0.0.0.0';
const DB_HOST = 'mongo';
const DB_PORT = 27017;
const DB_NAME = 'hrello';

async function connectToDatabase (host, port, dbName) {
    const DB_URL = `mongodb://${host}:${port}/${dbName}`;
    let client = await MongoClient.connect(DB_URL, {useNewUrlParser: true});
    return client.db(dbName);
}

(async function () {
    const app = express();
    app.use(
        express.json(),
        fileupload()
    );

    const db = await connectToDatabase(DB_HOST, DB_PORT, DB_NAME);

    app.get('/api/board/list', boardRoutes.list(db));
    app.post('/api/board/add', boardRoutes.add(db));
    app.post('/api/board/copy', boardRoutes.copy(db));
    app.post('/api/board/update', boardRoutes.update(db));
    app.get('/api/board/delete', boardRoutes.delete(db));
    app.get('/api/board/archive', boardRoutes.archive(db));

    app.get('/api/status/list', statusRoutes.list(db));
    app.get('/api/status/delete', statusRoutes.delete(db));
    app.post('/api/status/add', statusRoutes.add(db));
    app.post('/api/status/update', statusRoutes.update(db));

    app.get('/api/card/list', cardRoutes.list(db));
    app.get('/api/card/listArchive', cardRoutes.listArchive(db))
    app.get('/api/card/listAll', cardRoutes.listAll(db))
    app.get('/api/card/findOne', cardRoutes.findOne(db));
    app.get('/api/card/blacklist', cardRoutes.blacklist(db));
    app.get('/api/card/whitelist', cardRoutes.whitelist(db));
    app.get('/api/card/finishedlist', cardRoutes.finishedlist(db));
    app.get('/api/card/delete', cardRoutes.delete(db));
    app.post('/api/card/add', cardRoutes.add(db));
    app.post('/api/card/update', cardRoutes.update(db));

    app.post('/api/user/add', userRoutes.add(db));
    app.post('/api/user/login', userRoutes.login(db));
    app.post('/api/user/register', userRoutes.register(db));
    app.post('/api/user/googleLogin', userRoutes.googleLogin(db));
    app.get('/api/user/team', userRoutes.team(db));

    app.get('/api/event/listTimetable', eventRoutes.listTimetable(db));
    app.get('/api/event/listGlobal', eventRoutes.listGlobal(db));
    app.post('/api/event/addGlobal', eventRoutes.addGlobal(db));
    app.post('/api/event/addCardless', eventRoutes.addCardless(db));
    app.post('/api/event/updateCardless', eventRoutes.updateCardless(db));
    app.get('/api/event/deleteCardless', eventRoutes.deleteCardless(db));

    app.get('/api/field/listGlobal', fieldRoutes.listGlobal(db));
    app.post('/api/field/updateGlobal', fieldRoutes.updateGlobal(db));
    app.post('/api/field/addGlobal', fieldRoutes.addGlobal(db));
    app.post('/api/field/add', fieldRoutes.add(db));
    app.post('/api/field/update', fieldRoutes.update(db));

    app.post('/api/file', fileRoutes.upload(db));

    app.post('/api/invite/card', inviteRoutes.card(db));
    app.post('/api/invite/board', inviteRoutes.board(db));

    app.get('/api/id/generate', function (request, response) {
        response.send({id: shortid.generate()});
    });

    app.listen(PORT, HOST);
})();