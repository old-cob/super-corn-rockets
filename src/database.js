const knex = require('knex');
const config = require('config');
const logger = require('./logger')('database');

let connection;

module.exports.init = async function() {
  connection = knex({
    client: 'pg',
    connection: config.get('database')
  });

  await connection.raw('SELECT 1').catch(error => {
    console.log(error);
    logger.fatal('database connection failed', error);
    process.exit(1);
  });

  const hasUsersTable = await connection.schema.hasTable('users');
  if (!hasUsersTable) {
    await connection.schema.createTable('users', function(table) {
      table.increments();
      table.string('slack_user_id').notNullable();
      table.string('slack_team_id').notNullable();
      table.timestamps();

      table.unique(['user_id', 'team_id']);
    });
  }

  const hasSubscriptionsTable = await connection.schema.hasTable(
    'subscriptions'
  );
  if (!hasSubscriptionsTable) {
    await connection.schema.createTable('subscriptions', function(table) {
      table.increments();
      table.integer('user_id').notNullable();
      table.string('slack_conversation_id').notNullable();
      table.string('slack_conversation_type').notNullable();
      table.timestamps();
    });
  }

  const hasCatagoryTable = await connection.schema.hasTable('catagories');
  if (!hasCatagoryTable) {
    await connection.schema.createTable('catagories', function(table) {
      table.increments();
      table.string('value').notNullable();
      table.timestamps();
    });
  }

  const hasSubscriptionCatagoryTable = await connection.schema.hasTable(
    'subscriptions_catagories'
  );
  if (!hasSubscriptionCatagoryTable) {
    await connection.schema.createTable('subscriptions_catagories', function(
      table
    ) {
      table.increments();
      table.integer('subscription_id').notNullable();
      table.integer('catagory_id').notNullable();
      table.timestamps();
    });
  }

  const hasNotificationTable = await connection.schema.hasTable(
    'notifications'
  );
  if (!hasNotificationTable) {
    await connection.schema.createTable('notifications', function(table) {
      table.increments();
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
      table.timestamps();
    });
  }

  const hasLaunchTable = await connection.schema.hasTable('launches');
  if (!hasNotificationTable) {
    await connection.schema.createTable('launches', function(table) {
      table.increments();
      // TODO: add launch data
      table.timestamps();
    });
  }

  const hasLaunchCatagoryTable = await connection.schema.hasTable(
    'launches_catagories'
  );
  if (!hasSubscriptionCatagoryTable) {
    await connection.schema.createTable('launches_catagories', function(table) {
      table.increments();
      table.integer('launch_id').notNullable();
      table.integer('catagory_id').notNullable();
      table.timestamps();
    });
  }

  const hasLookupLaunchTimeTable = await connection.schema.hasTable(
    'lookup_launch_times'
  );
  if (!hasLookupLaunchTimeTable) {
    await connection.schema.createTable('lookup_launch_times', function(table) {
      table.increments();
      table.integer('launch_id').notNullable();
      table.datetime('launch_time_offset').notNullable();
      table.timestamps();
    });
  }
};

module.exports.connection = connection;
