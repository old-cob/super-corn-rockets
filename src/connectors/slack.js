const config = require('config');
const { WebClient } = require('@slack/client');

const client = new WebClient(config.get('slack.bot_user_oauth_access_token'));

module.exports = {
  client
};
