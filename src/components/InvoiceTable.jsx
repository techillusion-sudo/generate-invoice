"use client"
import { useRouter } from 'next/navigation';

const InvoiceTable = ({ invoices }) => {
  const router = useRouter();

  const calculateTotal = (items) => {
    return items?.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) || 0;
  };

  const handleView = (invoice) => {
    router.push(`/invoice/${invoice.id}`);
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
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="px-6 py-4 whitespace-nowrap">{invoice.invoiceNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(invoice.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{invoice.clientName}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                ${calculateTotal(invoice.items).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleView(invoice)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View
                </button>
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