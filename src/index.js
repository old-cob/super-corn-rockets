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
    res.json({
      response_type: 'ephemeral',
      text: 'ROCKET!!!'
    });

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

app.post('/events', bodyParser.json(), (req, res) => {
  if (req.body.type === 'url_verification') {
    logger.info('Url Verification');
    console.log(
      'req.body:\n' +
        require('util').inspect(req.body, { depth: null, colors: true })
    );
    res.send(req.body.challenge);
    return;
  }

  console.log(
    'req.body:\n' +
      require('util').inspect(req.body, { depth: null, colors: true })
  );
});

app.post(
  '/webhook/dialog',
  bodyParser.urlencoded({ extended: true }),
  (req, res) => {
    const body = JSON.parse(req.body.payload);

    if (body.type === 'dialog_submission') {
      // TODO: handle the errors
      console.log('body.submission:\n' + require('util').inspect(body.submission, { depth: null, colors: true }));

      slackClient.chat.postEphemeral({ channel: body.channel.id, user: body.user.id, text: 'You sent\n' + JSON.stringify(body.submission, null, 2) })
        .then((res) => {
          // `res` contains information about the posted message
          logger.info('Sent dialog confirmation')
        })
        .catch(console.error);

      res.status(200).send();
    }
  }
);

const PORT = config.get('server.port');
app.listen(PORT);
logger.info(`Server started on port ${PORT}`);
