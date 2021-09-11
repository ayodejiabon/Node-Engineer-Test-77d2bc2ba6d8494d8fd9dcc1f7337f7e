const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({path: '../config/.env'});

module.exports = {
  development: {
    client: process.env.DB_DIALECT,
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN), 
      max: parseInt(process.env.DB_POOL_MAX),
      createTimeoutMillis: 3000,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false
    },
    migrations: {directory: './migrations', tableName: 'migrations'},
    seeds:{directory: './seeds'}
  },
  staging: {
    client: process.env.DB_DIALECT,
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    ssl: { ca:fs.readFileSync(`${__dirname}/../config/cert.crt`)},
    pool: {
      min: parseInt(process.env.DB_POOL_MIN), 
      max: parseInt(process.env.DB_POOL_MAX),
      createTimeoutMillis: 3000,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false
    },
    migrations: {directory: './migrations',tableName: 'migrations'},
    seeds:{directory: './seeds'}
  },
  production: {
    client: process.env.DB_DIALECT,
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    ssl: { ca:fs.readFileSync(`${__dirname}/../config/cert.crt`)},
    pool: {min: parseInt(process.env.DB_POOL_MIN), max: parseInt(process.env.DB_POOL_MAX)},
    migrations: { directory: './migrations', tableName: 'migrations'}
  }
};