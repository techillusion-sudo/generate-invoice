// src/models/index.js
const Invoice = require('./invoice');
const InvoiceItem = require('./invoiceItem');
const Counter = require('./counter');

// Set up Invoice-InvoiceItem relationship
Invoice.hasMany(InvoiceItem, {
  foreignKey: 'invoiceId',
  as: 'items'
});

InvoiceItem.belongsTo(Invoice, {
  foreignKey: 'invoiceId'
});

module.exports = {
  Invoice,
  InvoiceItem,
  Counter
};