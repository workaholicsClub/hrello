'use strict';

const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const boardRoutes = require('./routes/board');
const userRoutes = require('./routes/user');
const cardRoutes = require('./routes/card');
const statusRoutes = require('./routes/status');
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
    app.get('/api/card/archive', cardRoutes.archive(db));
    app.post('/api/card/add', cardRoutes.add(db));
    app.post('/api/card/update', cardRoutes.update(db));

    app.post('/api/user/add', userRoutes.add(db));
    app.post('/api/user/login', userRoutes.login(db));

    app.get('/api/id/generate', function (request, response) {
        response.send({id: shortid.generate()});
    });

    app.listen(PORT, HOST);
})();