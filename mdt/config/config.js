require('dotenv').config();
const { parse } = require('pg-connection-string');

// Parse the DATABASE_URL
const dbConfig = parse(process.env.DATABASE_URL || '');

module.exports = {
  development: {
    username: dbConfig.user || 'postgres',
    password: dbConfig.password || 'password',
    database: dbConfig.database || 'task_management_application',
    host: dbConfig.host || 'localhost',
    port: dbConfig.port || 5432,
    dialect: 'postgres',
    'models-path': './src/models',
    'migrations-path': './migrations',
    'seeders-path': './seeders'
  },
  test: {
    username: dbConfig.user || 'postgres',
    password: dbConfig.password || 'password',
    database: (dbConfig.database || 'task_management_application') + '_test',
    host: dbConfig.host || 'localhost',
    port: dbConfig.port || 5432,
    dialect: 'postgres',
    'models-path': './src/models',
    'migrations-path': './migrations',
    'seeders-path': './seeders'
  },
  production: {
    username: dbConfig.user || 'postgres',
    password: dbConfig.password || 'password',
    database: (dbConfig.database || 'task_management_application') + '_prod',
    host: dbConfig.host || 'localhost',
    port: dbConfig.port || 5432,
    dialect: 'postgres',
    'models-path': './src/models',
    'migrations-path': './migrations',
    'seeders-path': './seeders'
  }
};