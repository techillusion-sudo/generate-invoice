"use client"
import { useRouter } from 'next/navigation';
import { Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

const PaymentStatusBadge = ({ status, onClick }) => {
  const statusStyles = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    PARTIAL: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </button>
  );
};

const StatusModal = ({ isOpen, onClose, onStatusChange, currentStatus }) => {
  if (!isOpen) return null;

  const statuses = ['PENDING', 'COMPLETED', 'PARTIAL', 'CANCELLED'];

  const statusStyles = {
    PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    COMPLETED: 'bg-green-100 text-green-800 hover:bg-green-200',
    PARTIAL: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-200'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">Update Payment Status</h2>
        <div className="space-y-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => {
                onStatusChange(status);
                onClose();
              }}
              className={`w-full p-2 rounded ${statusStyles[status]} mb-2 text-sm font-medium transition-colors
                ${currentStatus === status ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const InvoiceTable = ({ invoices, onDeleteInvoice, onUpdatePaymentStatus }) => {
  const router = useRouter();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

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

  const handleStatusClick = (invoice, e) => {
    e.stopPropagation();
    setSelectedInvoice(invoice);
    setIsStatusModalOpen(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (selectedInvoice) {
      await onUpdatePaymentStatus(selectedInvoice.id, newStatus);
      setIsStatusModalOpen(false);
      setSelectedInvoice(null);
    }
  };

  return (
    <>
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
                Payment Status
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
                  <PaymentStatusBadge 
                    status={invoice.paymentStatus} 
                    onClick={(e) => handleStatusClick(invoice, e)}
                  />
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

      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedInvoice(null);
        }}
        onStatusChange={handleStatusChange}
        currentStatus={selectedInvoice?.paymentStatus}
      />
    </>
  );
};

export default InvoiceTable;