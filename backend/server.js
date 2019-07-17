'use strict';

const express = require('express');

const PORT = 3000;
const HOST = '0.0.0.0';

const app = express();
app.get('/', (request, response) => {
    response.send('Hello world\n');
});

app.listen(PORT, HOST);