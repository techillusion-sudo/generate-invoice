// src/components/InvoiceTable.jsx
"use client"
import { useRouter } from 'next/navigation';
import { Trash2, Eye } from 'lucide-react';

const InvoiceTable = ({ invoices, onDeleteInvoice }) => {
  const router = useRouter();

  const calculateTotal = (invoice) => {
    const subtotal = invoice.items?.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) || 0;
    const discount = (subtotal * (invoice.discount || 0)) / 100;
    return subtotal - discount;
  };

  const handleView = (invoice) => {
    router.push(`/invoice/${invoice.id}`);
  };

  const handleDelete = async (invoice, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await onDeleteInvoice(invoice.id);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Currency
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Referred By
    </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr 
              key={invoice.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => handleView(invoice)}
            >
              <td className="px-6 py-4 whitespace-nowrap">{invoice.invoiceNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(invoice.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{invoice.clientName}</td>
              <td className="px-6 py-4 whitespace-nowrap">{invoice.currencyCode}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {invoice.currencySymbol}{calculateTotal(invoice).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
        {invoice.referredBy || 'Ali Raza'}
      </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(invoice);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(invoice, e)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {invoices.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No invoices found
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;