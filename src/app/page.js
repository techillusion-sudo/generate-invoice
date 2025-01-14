// src/app/page.jsx
'use client';

import { useState, useEffect } from 'react';
import InvoiceModal from '../components/InvoiceModal';
import InvoiceTable from '../components/InvoiceTable';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchCurrentInvoiceNumber = async () => {
    try {
      const response = await fetch('/api/invoices?current=true');
      const data = await response.json();
      if (data.currentInvoiceNumber) {
        setNextInvoiceNumber(data.currentInvoiceNumber);
      }
    } catch (error) {
      console.error('Error fetching invoice number:', error);
    }
  };

  const handleOpenModal = () => {
    fetchCurrentInvoiceNumber();
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }
      
      await fetchInvoices();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isLoading}
        >
          Add Invoice
        </button>
      </div>

      <InvoiceTable 
        invoices={invoices} 
        onView={(invoice) => console.log('View invoice:', invoice)} 
      />
      
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        defaultInvoiceNumber={nextInvoiceNumber}
        isLoading={isLoading}
      />
    </div>
  );
}