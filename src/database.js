const knex = require('knex');
const config = require('config');
const logger = require('./logger')('database');

module.exports.init = async function() {
  const connection = knex({
    client: 'pg',
    connection: config.get('database')
  });

  // Make sure the connection to the database is good
  await connection.raw('SELECT 1').catch(error => {
    logger.fatal({ error }, 'database connection failed:', error.message);
    process.exit(1);
  });

  await createTable(connection, 'User', table => {
    table.string('SlackUserId').notNullable();
    table.string('SlackTeamId').notNullable();

    table.unique(['SlackUserId', 'SlackTeamId']);
  });

  await createTable(connection, 'Subscription', table => {
    table
      .uuid('UserId')
      .notNullable()
      .references('id')
      .inTable('User');
    table.string('SlackConversationId').notNullable();
    table.string('SlackConversationType').notNullable();
  });

  await createTable(connection, 'Catagory', table => {
    table.string('Value').notNullable();
  });

  await createTable(connection, 'SubscriptionCatagory', table => {
    table
      .uuid('SubscriptionId')
      .notNullable()
      .references('id')
      .inTable('Subscription');
    table
      .uuid('CatagoryId')
      .notNullable()
      .references('id')
      .inTable('Catagory');
  });

  await createTable(connection, 'Launch', table => {
    // TODO: add launch data
  });

  await createTable(connection, 'Notification', table => {
    table
      .uuid('SubscriptionId')
      .notNullable()
      .references('id')
      .inTable('Subscription');
    table
      .uuid('LaunchId')
      .notNullable()
      .references('id')
      .inTable('Launch');
    table
      .boolean('Sent')
      .notNullable()
      .defaultTo(false);
    // 5 minutes
    // 60 minutes
    // 24 hours = 1440 minutes
    table.integer('TimeUntilLaunch').notNullable();
  });

  await createTable(connection, 'LaunchCatagory', table => {
    table
      .uuid('LaunchId')
      .notNullable()
      .references('id')
      .inTable('Launch');
    table
      .uuid('CatagoryId')
      .notNullable()
      .references('id')
      .inTable('Catagory');
  });

  await createTable(connection, 'LookupLaunchTimes', table => {
    table
      .uuid('LaunchId')
      .notNullable()
      .references('id')
      .inTable('Launch');
    table.datetime('LaunchTimeOffset').notNullable();
  });

  return connection;
};

function createTable(connection, name, cb) {
  return connection.schema
    .hasTable(name)
    .then(exists => {
      if (!exists) {
        return connection.schema
          .createTable(name, table => {
            table
              .uuid('id')
              .primary()
              .defaultTo(connection.raw('gen_random_uuid()'));
            table.timestamps();
            cb(table);
          })
          .then(() => {
            logger.debug('Create table:', name);
          });
      }
    })
    .catch(error => {
      logger.fatal({ error }, 'database connection failed:', error.message);
      process.exit(1);
    });
}
