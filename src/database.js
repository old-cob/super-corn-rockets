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

  await connection.schema.createTable('users', function (table) {
    table.increments();
    table.string('user_id');
    table.timestamps();
  })
};

module.exports.connection = connection;
