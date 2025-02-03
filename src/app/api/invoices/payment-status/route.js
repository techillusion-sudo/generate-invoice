// src/app/api/invoices/payment-status/route.js
import { NextResponse } from 'next/server';
import { Invoice } from '@/models';

export async function PATCH(request) {
  try {
    const data = await request.json();
    const { id, paymentStatus } = data;

    if (!id || !paymentStatus) {
      return NextResponse.json(
        { error: 'Invoice ID and payment status are required' },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    await invoice.update({ paymentStatus });
    return NextResponse.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}