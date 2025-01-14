// src/models/counter.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Counter = sequelize.define('Counter', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sequence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'counters',
  timestamps: true
});

// Function to generate next invoice number
Counter.generateNextInvoiceNumber = async function() {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2); // Get last 2 digits of year
  const counterId = `INVOICE_${currentYear}`;

  try {
    // Use a transaction to ensure atomicity
    const result = await sequelize.transaction(async (t) => {
      // Find or create counter for current year
      const [counter] = await Counter.findOrCreate({
        where: { id: counterId },
        defaults: {
          year: currentYear,
          sequence: 0
        },
        transaction: t,
        lock: true // Use row-level locking
      });

      // Increment sequence
      const newSequence = counter.sequence + 1;
      await counter.update({ sequence: newSequence }, { transaction: t });

      // Format: NV-1000-YY-XXXX
      return `NV-1000-${yearSuffix}-${newSequence.toString().padStart(4, '0')}`;
    });

    return result;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    throw error;
  }
};

module.exports = Counter;