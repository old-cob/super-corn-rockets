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

  await createTable(connection, 'users', table => {
    table.string('slack_user_id').notNullable();
    table.string('slack_team_id').notNullable();

    table.unique(['slack_user_id', 'slack_team_id']);
  });

  await createTable(connection, 'subscriptions', table => {
    table.integer('user_id').notNullable();
    table.string('slack_conversation_id').notNullable();
    table.string('slack_conversation_type').notNullable();
  });

  await createTable(connection, 'catagories', table => {
    table.string('value').notNullable();
  });

  await createTable(connection, 'subscriptions_catagories', table => {
    table.integer('subscription_id').notNullable();
    table.integer('catagory_id').notNullable();
  });

  await createTable(connection, 'notifications', table => {
    table.integer('subscription_id').notNullable();
    table.integer('launch_id').notNullable();
    table
      .boolean('sent')
      .notNullable()
      .defaultTo(false);
    // 5 minutes
    // 60 minutes
    // 24 hours = 1440 minutes
    table.integer('time_until_launch').notNullable();
  });

  await createTable(connection, 'launches', table => {
    // TODO: add launch data
  });

  await createTable(connection, 'launches_catagories', table => {
    table.integer('launch_id').notNullable();
    table.integer('catagory_id').notNullable();
  });

  await createTable(connection, 'lookup_launch_times', table => {
    table.integer('launch_id').notNullable();
    table.datetime('launch_time_offset').notNullable();
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
