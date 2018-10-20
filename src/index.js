const express = require('express');
const config = require('config');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = config.get('server.port');
app.listen(PORT);
console.log(`Server started on port ${PORT}`);
