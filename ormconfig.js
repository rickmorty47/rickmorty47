/* eslint-disable */

const join = require("path").join;
require('ts-node/register');

console.log('ORM CONFIG LOADED FROM "ormconfig.js"');

const typeORMConfig = {
    type: 'postgres',

    host: process.env.DB_HOST || 'localhost',
    port: +process.env.DB_PORT || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'test',

    entities: [join(__dirname, join('**/*.entity.js'))],

    logging: process.env.LOG_LEVEL,
}

const migrationsConfig = {
    ...typeORMConfig,
    name: 'migrations',
    migrationsTableName: 'migrations',
    migrations: [join(__dirname, 'migrations/*.{ts,js}')],
}

const seedsConfig = {
    ...typeORMConfig,
    name: 'seeds',
    migrationsTableName: 'seeds',
    migrations: [join(__dirname, 'seeds/*.{ts,js}')],
}

module.exports = [
  Object.assign(
    {
      ...migrationsConfig,
      cli: {migrationsDir: 'src/migrations'},

      // Нужно, что бы работало migration:revert
      name: 'default',
    },
    module.exports,
  ),
  Object.assign(
    {
      ...seedsConfig,
      cli: { migrationsDir: 'src/seeds'},

      name: 'seeds',
    },
    module.exports,
  ),
];
