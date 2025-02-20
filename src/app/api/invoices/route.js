// src/app/api/invoices/route.js
import { NextResponse } from 'next/server';
import { Op } from 'sequelize';  // Add this import
import sequelize from '@/config/database';
import { Invoice, InvoiceItem, Counter } from '@/models';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const isCurrent = searchParams.get('current') === 'true';

    // If requesting specific invoice by ID
    if (id) {
      const invoice = await Invoice.findByPk(id, {
        include: [{
          model: InvoiceItem,
          as: 'items'
        }]
      });

      if (!invoice) {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(invoice);
    }

    // If requesting current invoice number
    if (isCurrent) {
      const currentYear = new Date().getFullYear();
      const yearSuffix = currentYear.toString().slice(-2);

      // Get the latest invoice number for the current year
      const latestInvoice = await Invoice.findOne({
        where: {
          invoiceNumber: {
            [Op.like]: `INV-1000-${yearSuffix}-%`
          }
        },
        order: [['invoiceNumber', 'DESC']]
      });

      let nextSequence;
      if (latestInvoice) {
        // Extract the sequence number from the latest invoice
        const match = latestInvoice.invoiceNumber.match(/(\d+)$/);
        nextSequence = match ? parseInt(match[1]) + 1 : 1;
      } else {
        nextSequence = 1;
      }

      const currentInvoiceNumber = `INV-1000-${yearSuffix}-${nextSequence.toString().padStart(4, '0')}`;
      return NextResponse.json({ currentInvoiceNumber });
    }

    // Otherwise, return all invoices
    const invoices = await Invoice.findAll({
      include: [{
        model: InvoiceItem,
        as: 'items'
      }],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// src/app/api/invoices/route.js
export async function POST(request) {
  try {
    const data = await request.json();

    const result = await sequelize.transaction(async (t) => {
      const currentYear = new Date().getFullYear();
      const yearSuffix = currentYear.toString().slice(-2);

      // Find the latest invoice number for the current year
      const latestInvoice = await Invoice.findOne({
        where: {
          invoiceNumber: {
            [Op.like]: `INV-1000-${yearSuffix}-%`
          }
        },
        order: [['invoiceNumber', 'DESC']],
        transaction: t
      });

      let nextSequence;
      if (latestInvoice) {
        const match = latestInvoice.invoiceNumber.match(/(\d+)$/);
        nextSequence = match ? parseInt(match[1]) + 1 : 1;
      } else {
        nextSequence = 1;
      }

      const invoiceNumber = `INV-1000-${yearSuffix}-${nextSequence.toString().padStart(4, '0')}`;

      // Create the invoice with all fields including referredBy
      const invoice = await Invoice.create({
        invoiceNumber,
        date: new Date(data.date),
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        clientEmail: data.clientEmail,
        street: data.street,
        city: data.city,
        country: data.country,
        discount: parseFloat(data.discount) || 0,
        currencyCode: data.currencyCode || 'USD',
        currencySymbol: data.currencySymbol || '$',
        currencyName: data.currencyName || 'US Dollar',
        referredBy: data.referredBy || null  // Add this line
      }, { transaction: t });

      // Create invoice items
      if (data.items && data.items.length > 0) {
        const itemsToCreate = data.items.map(item => ({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: parseFloat(item.quantity) * parseFloat(item.rate)
        }));

        await InvoiceItem.bulkCreate(itemsToCreate, { transaction: t });
      }

      // Fetch complete invoice with items
      return await Invoice.findByPk(invoice.id, {
        include: [{
          model: InvoiceItem,
          as: 'items'
        }],
        transaction: t
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    await sequelize.transaction(async (t) => {
      // Delete items first due to foreign key constraint
      await InvoiceItem.destroy({
        where: { invoiceId: id },
        transaction: t
      });

      // Delete the invoice
      await Invoice.destroy({
        where: { id },
        transaction: t
      });
    });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}