const dotenv = require('dotenv');
const { Model } = require('objection');
dotenv.config({path: '../config/.env'});
const environment = process.env.NODE_ENV;
const config = require('./knexfile.js')[environment];
const pool = require('knex')(config);
Model.knex(pool);
module.exports = Model;