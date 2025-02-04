// // src/app/page.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import InvoiceModal from '../components/InvoiceModal';
// import InvoiceTable from '../components/InvoiceTable';
// import currencies from '../data/currencies.json';

// export default function Home() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [invoices, setInvoices] = useState([]);
//   const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
  
//   useEffect(() => {
//     fetchInvoices();
//   }, []);

//   const fetchInvoices = async () => {
//     try {
//       const response = await fetch('/api/invoices');
//       const data = await response.json();
//       setInvoices(data);
//     } catch (error) {
//       console.error('Error fetching invoices:', error);
//     }
//   };

//   const fetchCurrentInvoiceNumber = async () => {
//     try {
//       const response = await fetch('/api/invoices?current=true');
//       const data = await response.json();
//       if (data.currentInvoiceNumber) {
//         setNextInvoiceNumber(data.currentInvoiceNumber);
//       }
//     } catch (error) {
//       console.error('Error fetching invoice number:', error);
//     }
//   };

//   const handleOpenModal = () => {
//     fetchCurrentInvoiceNumber();
//     setIsModalOpen(true);
//   };

//   const handleSubmit = async (formData) => {
//     setIsLoading(true);
//     try {
//       const selectedCurrency = currencies[formData.currencyCode];
//       const enrichedFormData = {
//         ...formData,
//         currencySymbol: selectedCurrency.symbol,
//         currencyName: selectedCurrency.name
//       };

//       const response = await fetch('/api/invoices', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(enrichedFormData),
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to create invoice');
//       }
      
//       await fetchInvoices();
//       setIsModalOpen(false);
//     } catch (error) {
//       console.error('Error creating invoice:', error);
//       alert('Failed to create invoice: ' + error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteInvoice = async (invoiceId) => {
//     try {
//       const response = await fetch(`/api/invoices?id=${invoiceId}`, {
//         method: 'DELETE',
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to delete invoice');
//       }

//       await fetchInvoices();
//     } catch (error) {
//       console.error('Error deleting invoice:', error);
//       alert('Failed to delete invoice: ' + error.message);
//     }
//   };

//   const handleUpdatePaymentStatus = async (invoiceId, paymentStatus) => {
//     try {
//       const response = await fetch('/api/invoices/payment-status', {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ id: invoiceId, paymentStatus }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to update payment status');
//       }

//       await fetchInvoices();
//     } catch (error) {
//       console.error('Error updating payment status:', error);
//       alert('Failed to update payment status: ' + error.message);
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Invoices</h1>
//         <button
//           onClick={handleOpenModal}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           disabled={isLoading}
//         >
//           Add Invoice
//         </button>
//       </div>

//       <InvoiceTable 
//         invoices={invoices}
//         onDeleteInvoice={handleDeleteInvoice}
//         onUpdatePaymentStatus={handleUpdatePaymentStatus}
//       />
      
//       <InvoiceModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSubmit={handleSubmit}
//         defaultInvoiceNumber={nextInvoiceNumber}
//         isLoading={isLoading}
//         currencies={currencies}
//       />
//     </div>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import InvoiceModal from '../components/InvoiceModal';
import InvoiceTable from '../components/InvoiceTable';
import currencies from '../data/currencies.json';
import { TrendingUp, Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

const DashboardCard = ({ title, value, icon: Icon, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-lg p-6 shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm ${textColor} opacity-80`}>{title}</p>
        <h3 className={`text-2xl font-bold ${textColor} mt-1`}>{value}</h3>
      </div>
      <div className={`${textColor} opacity-80`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0,
    partialAmount: 0,
    cancelledAmount: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    completedInvoices: 0
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    calculateDashboardStats();
  }, [invoices]);

  const calculateDashboardStats = () => {
    const stats = {
      totalAmount: 0,
      pendingAmount: 0,
      completedAmount: 0,
      partialAmount: 0,
      cancelledAmount: 0,
      totalInvoices: invoices.length,
      pendingInvoices: 0,
      completedInvoices: 0
    };

    invoices.forEach(invoice => {
      // Calculate total amount for this invoice
      const subtotal = invoice.items?.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) || 0;
      const discount = (subtotal * (invoice.discount || 0)) / 100;
      const total = subtotal - discount;

      // Convert to USD for consistent calculations (you might want to add proper currency conversion later)
      const amount = total;

      // Update stats based on payment status
      switch (invoice.paymentStatus) {
        case 'PENDING':
          stats.pendingAmount += amount;
          stats.pendingInvoices++;
          break;
        case 'COMPLETED':
          stats.completedAmount += amount;
          stats.completedInvoices++;
          break;
        case 'PARTIAL':
          stats.partialAmount += amount;
          break;
        case 'CANCELLED':
          stats.cancelledAmount += amount;
          break;
      }

      stats.totalAmount += amount;
    });

    setDashboardStats(stats);
  };

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
      const selectedCurrency = currencies[formData.currencyCode];
      const enrichedFormData = {
        ...formData,
        currencySymbol: selectedCurrency.symbol,
        currencyName: selectedCurrency.name
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrichedFormData),
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

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoices?id=${invoiceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invoice');
      }

      await fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice: ' + error.message);
    }
  };

  const handleUpdatePaymentStatus = async (invoiceId, paymentStatus) => {
    try {
      const response = await fetch('/api/invoices/payment-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: invoiceId, paymentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment status');
      }

      await fetchInvoices();
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard
          title="Total Invoices"
          value={dashboardStats.totalInvoices}
          icon={TrendingUp}
          bgColor="bg-blue-500"
          textColor="text-white"
        />
        <DashboardCard
          title="Pending Amount"
          value={formatCurrency(dashboardStats.pendingAmount)}
          icon={Clock}
          bgColor="bg-yellow-500"
          textColor="text-white"
        />
        <DashboardCard
          title="Completed Amount"
          value={formatCurrency(dashboardStats.completedAmount)}
          icon={CheckCircle}
          bgColor="bg-green-500"
          textColor="text-white"
        />
        <DashboardCard
          title="Total Amount"
          value={formatCurrency(dashboardStats.totalAmount)}
          icon={DollarSign}
          bgColor="bg-purple-500"
          textColor="text-white"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Payment Status Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Invoices:</span>
              <span className="font-semibold">{dashboardStats.pendingInvoices}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Invoices:</span>
              <span className="font-semibold">{dashboardStats.completedInvoices}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completion Rate:</span>
              <span className="font-semibold">
                {dashboardStats.totalInvoices > 0
                  ? `${((dashboardStats.completedInvoices / dashboardStats.totalInvoices) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Table Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
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
          onDeleteInvoice={handleDeleteInvoice}
          onUpdatePaymentStatus={handleUpdatePaymentStatus}
        />
      </div>
      
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        defaultInvoiceNumber={nextInvoiceNumber}
        isLoading={isLoading}
        currencies={currencies}
      />
    </div>
  );
}