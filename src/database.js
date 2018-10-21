const knex = require('knex');
const config = require('config');
const logger = require('./logger')('database');

let connection;

module.exports.init = async function() {
  connection = knex({
    client: 'pg',
    connection: config.get('database')
  });

  // Make sure the connection to the database is good
  await connection.raw('SELECT 1').catch(error => {
    console.log(error);
    logger.fatal('database connection failed', error);
    process.exit(1);
  });

  await createTable('users', table => {
    table.string('slack_user_id').notNullable();
    table.string('slack_team_id').notNullable();

    table.unique(['user_id', 'team_id']);
  });

  await createTable('subscriptions', table => {
    table.integer('user_id').notNullable();
    table.string('slack_conversation_id').notNullable();
    table.string('slack_conversation_type').notNullable();
  });

  await createTable('catagories', table => {
    table.string('value').notNullable();
  });

  await createTable('subscriptions_catagories', table => {
    table.integer('subscription_id').notNullable();
    table.integer('catagory_id').notNullable();
  });

  await createTable('notifications', table => {
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

  await createTable('launches', table => {
    // TODO: add launch data
  });

  await createTable('launches_catagories', table => {
    table.integer('launch_id').notNullable();
    table.integer('catagory_id').notNullable();
  });

  await createTable('lookup_launch_times', table => {
    table.integer('launch_id').notNullable();
    table.datetime('launch_time_offset').notNullable();
  });
};

async function createTable(name, cb) {
  if (!(await connection.schema.hasTable(name))) {
    await connection.schema.createTable(name, table => {
      table.increments();
      table.timestamps();
      cb(table);
    });
  }
}

module.exports.connection = connection;
