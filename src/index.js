const express = require('express');
const config = require('config');

const logger = require('./logger')('index');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = config.get('server.port');
app.listen(PORT);
logger.info(`Server started on port ${PORT}`);
