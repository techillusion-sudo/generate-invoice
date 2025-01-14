const { Sequelize } = require('sequelize');
const pg = require('pg');

// Load environment variables
require('dotenv').config();

const isDevelopment = process.env.NODE_ENV === 'development';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions: {
        ssl: !isDevelopment ? {
            require: true,
            rejectUnauthorized: false
        } : false
    },
    logging: isDevelopment ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = sequelize;