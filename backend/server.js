'use strict';

const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const boardRoutes = require('./routes/board');
const userRoutes = require('./routes/user');
const cardRoutes = require('./routes/card');
const statusRoutes = require('./routes/status');
const eventRoutes = require('./routes/event');
const fieldRoutes = require('./routes/field');
const shortid = require('shortid');

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
    app.use(express.json());

    const db = await connectToDatabase(DB_HOST, DB_PORT, DB_NAME);

    app.get('/api/board/list', boardRoutes.list(db));
    app.post('/api/board/add', boardRoutes.add(db));
    app.post('/api/board/update', boardRoutes.update(db));

    app.get('/api/status/list', statusRoutes.list(db));
    app.get('/api/status/archive', statusRoutes.archive(db));
    app.post('/api/status/add', statusRoutes.add(db));
    app.post('/api/status/update', statusRoutes.update(db));

    app.get('/api/card/list', cardRoutes.list(db));
    app.get('/api/card/findOne', cardRoutes.findOne(db));
    app.get('/api/card/blacklist', cardRoutes.blacklist(db));
    app.get('/api/card/whitelist', cardRoutes.whitelist(db));
    app.get('/api/card/finishedlist', cardRoutes.finishedlist(db));
    app.post('/api/card/add', cardRoutes.add(db));
    app.post('/api/card/update', cardRoutes.update(db));

    app.post('/api/user/add', userRoutes.add(db));
    app.post('/api/user/login', userRoutes.login(db));

    app.get('/api/event/listTimetable', eventRoutes.listTimetable(db));
    app.get('/api/event/listGlobal', eventRoutes.listGlobal(db));
    app.post('/api/event/addGlobal', eventRoutes.addGlobal(db));
    app.post('/api/event/addCardless', eventRoutes.addCardless(db));

    app.get('/api/field/listGlobal', fieldRoutes.listGlobal(db));
    app.post('/api/field/updateGlobal', fieldRoutes.updateGlobal(db));
    app.post('/api/field/addGlobal', fieldRoutes.addGlobal(db));

    app.get('/api/id/generate', function (request, response) {
        response.send({id: shortid.generate()});
    });

    app.listen(PORT, HOST);
})();