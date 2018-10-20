const express = require('express');
const config = require('config');
const bodyParser = require('body-parser');

const logger = require('./logger')('index');

const app = express();

app.post('/webhook/slash/:name', bodyParser.urlencoded(), (req, res) => {
  console.log('req.body:\n' + require('util').inspect(req.body, { depth: null, colors: true }));
  console.log('req.params:\n' + require('util').inspect(req.params, { depth: null, colors: true }));
  res.json({
    response_type: 'ephemeral',
    text: 'ROCKET!!!'
  });
});

const PORT = config.get('server.port');
app.listen(PORT);
logger.info(`Server started on port ${PORT}`);
