const express = require('express');
const config = require('config');
const bodyParser = require('body-parser');
const { WebClient } = require('@slack/client');
const pinoLogger = require('express-pino-logger');

const logger = require('./logger')('index');
const database = require('./database');
const slackClient = require('./connectors/slack').client;

async function start() {
  const connection = await database.init();

  const app = express();

  // Log requests
  app.use(pinoLogger({ logger: logger.child({ name: 'request' }) }));

  // Attach database connection to requests
  app.use((req, res, next) => {
    if (!req.context) req.context = {};
    req.context.connection = connection;
    next();
  });

  app.get('/ping', (req, res) => {
    res.send('pong');
  });

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
            callback_id: 'a-super-important-id',
            title: 'Subscribe to Launches',
            submit_label: 'Subscribe',
            state: '',
            elements: [
              {
                type: 'select',
                label: 'Channel to Notify',
                name: 'notify_destinantion',
                data_source: 'conversations'
              },
              {
                type: 'select',
                label: 'Launch Organization',
                name: 'launch_organization',
                options: [
                  {
                    label: 'All',
                    value: 'all'
                  },
                  {
                    label: 'All Private Companies',
                    value: 'all_private'
                  },
                  {
                    label: 'Private Company - SpaceX',
                    value: 'spacex'
                  },
                  {
                    label: 'Private Company - Blue Origin',
                    value: 'blue_origin'
                  },
                  {
                    label: 'All Governments',
                    value: 'all_government'
                  },
                  {
                    label: 'Government - United States',
                    value: 'usa'
                  },
                  {
                    label: 'Government - Russia',
                    value: 'russia'
                  }
                ]
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
            'err:\n' +
              require('util').inspect(err, { depth: null, colors: true })
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
        console.log(
          'body.submission:\n' +
            require('util').inspect(body.submission, {
              depth: null,
              colors: true
            })
        );

        slackClient.chat
          .postEphemeral({
            channel: body.channel.id,
            user: body.user.id,
            text: 'You sent\n' + JSON.stringify(body.submission, null, 2)
          })
          .then(res => {
            // `res` contains information about the posted message
            logger.info('Sent dialog confirmation');
          })
          .catch(console.error);

        res.status(200).send();
      }
    }
  );

  const PORT = config.get('server.port');
  app.listen(PORT);
  logger.info(`Server started on port ${PORT}`);
}
start();
