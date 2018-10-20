const express = require('express');
const config = require('config');
const bodyParser = require('body-parser');
const { WebClient } = require('@slack/client');

const logger = require('./logger')('index');

const app = express();
const slackClient = new WebClient(
  config.get('slack.bot_user_oauth_access_token')
);

app.post(
  '/webhook/slash/:name',
  bodyParser.urlencoded({ extended: true }),
  (req, res) => {
    console.log(
      'req.body:\n' +
        require('util').inspect(req.body, { depth: null, colors: true })
    );
    console.log(
      'req.params:\n' +
        require('util').inspect(req.params, { depth: null, colors: true })
    );
    res.json({
      response_type: 'ephemeral',
      text: 'ROCKET!!!'
    });

    // console.log('req.body.channel_id:\n' + require('util').inspect(req.body.channel_id, { depth: null, colors: true }));
    // slackClient.chat.postMessage({ channel: req.body.channel_id, text: 'Hello there' })
    //   .then((res) => {
    //     // `res` contains information about the posted message
    //     console.log('Message sent:\n' + require('util').inspect(res, { depth: null, colors: true }));
    //   }).catch((err) => {
    //     console.log('err:\n' + require('util').inspect(err, { depth: null, colors: true }));
    //   });

    slackClient.dialog
      .open({
        trigger_id: req.body.trigger_id,
        dialog: {
          callback_id: 'ryde-46e2b0',
          title: 'Request a Ride',
          submit_label: 'Request',
          notify_on_cancel: true,
          state: 'Limo',
          elements: [
            {
              type: 'text',
              label: 'Pickup Location',
              name: 'loc_origin'
            },
            {
              type: 'text',
              label: 'Dropoff Location',
              name: 'loc_destination'
            }
          ]
        }
      })
      .then(res => {
        // `res` contains information about the posted message
        console.log(
          'Message sent:\n' +
            require('util').inspect(res, { depth: null, colors: true })
        );
      })
      .catch(err => {
        console.log(
          'err:\n' + require('util').inspect(err, { depth: null, colors: true })
        );
      });
  }
);

const PORT = config.get('server.port');
app.listen(PORT);
logger.info(`Server started on port ${PORT}`);
