'use strict';

const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const boardRoutes = require('./routes/board');
const userRoutes = require('./routes/user');
const cardRoutes = require('./routes/card');

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

    app.get('/api/card/list', cardRoutes.list(db));
    app.post('/api/card/add', cardRoutes.add(db));
    app.post('/api/card/update', cardRoutes.update(db));

    app.post('/api/user/add', userRoutes.add(db));

    app.listen(PORT, HOST);
})();