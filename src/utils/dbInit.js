// src/utils/initializeDatabase.js
const sequelize = require('../config/database');
const { Invoice, InvoiceItem, Counter } = require('../models');

const isDevelopment = process.env.NODE_ENV === 'development';

async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        
        // Sync all models
        await sequelize.sync({ alter: isDevelopment });
        console.log('✅ Database models synchronized successfully.');
        
        return true;
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        return false;
    }
}

module.exports = initializeDatabase;