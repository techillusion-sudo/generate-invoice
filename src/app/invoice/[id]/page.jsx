"use client";
import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';

// Dynamic import for html2pdf (client-side only)
const html2pdf = dynamic(() => import('html2pdf.js'), {
  ssr: false
});
const Invoice = ({ params }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Fetch invoice data
  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const response = await fetch(`/api/invoices?id=${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setInvoice(data);
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInvoiceData();
    }
  }, [params.id]);

  // Transform invoice items to table data format
  // Transform invoice items to table data format
  const tableData =
    invoice?.items?.map((item) => ({
      description: item.description,
      unitPrice: item.rate,
      quantity: item.quantity,
      total: item.amount,
    })) || [];

  // Add payment and invoice status
  const invoiceStatus = "UNPAID";
  const paymentDetails = {
    bank: "ABC Bank",
    accountName: "Techillusion",
    accountNumber: "1234-5678-9012-3456",
    swiftCode: "ABCDPKXX",
    iban: "PK36ABCD1234567890123456",
  };

  // Add invoice metadata
  const invoiceData = invoice
    ? {
      number: invoice.invoiceNumber,
      date: new Date(invoice.date).toLocaleDateString(),
      dueDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      terms: "Net 30",
    }
    : {
      number: "",
      date: new Date().toLocaleDateString(),
      dueDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      terms: "Net 30",
    };

  // Calculate totals
  const calculateSubtotal = () => {
    return tableData.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const subtotal = calculateSubtotal();
  // Get discount from invoice data or default to 0
  const discount = invoice?.discount || 0;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  // Print styles
  // Add this effect in your component
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
    @page {
      size: A4;
      margin: 0;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        forced-color-adjust: exact !important;
        color-scheme: light !important;
      }
      .print-wrapper {
        padding: 0 !important;
        background: none !important;
      }
      #invoice {
        margin: 0 !important;
        padding: 0 !important;
        width: 210mm !important;
        min-height: 297mm !important;
      }
      .print\:hidden {
        display: none !important;
      }
    }

    /* Additional styles for better PDF generation */
    #invoice {
      background-color: white !important;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    
    #invoice img {
      max-width: 100%;
      height: auto;
    }
    
    @media screen {
      .print-wrapper {
        min-height: 297mm;
        background-color: rgb(229, 231, 235);
        padding: 2.5rem;
      }
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);

      // Dynamically import html2pdf only when needed
      const html2pdf = (await import('html2pdf.js')).default;

      const element = document.getElementById('invoice');
      const options = {
        margin: 0,
        filename: `${invoiceData.number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      const worker = html2pdf().set(options);
      await worker.from(element).save();

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };


  return (
    <div className="relative">
      {/* Action Buttons */}
      <div className="fixed top-4 right-4 space-x-2 print:hidden z-50">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${isGeneratingPdf ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Print
        </button>
      </div>

      <div className="print-wrapper flex justify-center items-center bg-gray-200 p-10">
        <div
          id="invoice"
          className="min-h-screen bg-white text-black light print:min-h-[297mm] print:w-[210mm] w-[210mm] print:m-0 print:p-0 relative flex flex-col"
        >


          {/* Header */}
          <div className="w-full bg-white -mt-1 relative">
            <img
              src="/assets/header.png"
              alt="Company Logo"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Main Content */}
          <div className="w-full max-w-4xl mx-auto px-10 print:max-w-none">
            {/* Invoice Details */}
            <div className="flex justify-end items-start mb-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h1>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Invoice #: {invoiceData.number}</p>
                  <p>Invoice Date: {invoiceData.date}</p>
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* From section - static */}
              <div className="p-4 bg-[#e6e6e5] rounded-lg">
                <h3 className="font-semibold mb-2 text-gray-700 text-lg">
                  From:
                </h3>
                <p className="text-gray-600 text-sm">Techillusion</p>
                <p className="text-gray-600 text-sm">
                  Shama Colony Begum Kot Shahdrah Lahore
                </p>
                <div>
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">Phone:</span> +92 333 4303325
                    / +92 300 4503593
                  </p>
                </div>
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold">Email:</span>{" "}
                  official.techillusion@gmail.com
                </p>
              </div>

              {/* Bill To section - dynamic */}
              <div className="p-4 bg-[#e6e6e5] rounded-lg">
                <h3 className="font-semibold mb-2 text-gray-700 text-lg">
                  To:
                </h3>
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold"></span>
                  {invoice?.clientName || ""}
                </p>
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold"></span>
                  {invoice?.street
                    ? `${invoice.street}, ${invoice.city}, ${invoice.country}`
                    : ""}
                </p>
                <p className="text-gray-600 text-sm">
                  {" "}
                  <span className="font-semibold">Phone: </span>
                  {invoice?.clientPhone || ""}
                </p>
                <p className="text-gray-600 text-sm">
                  {" "}
                  <span className="font-semibold">Email: </span>
                  {invoice?.clientEmail || ""}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#e6e6e5] border-none">
                    <th className="border border-gray-400 p-2 text-left w-12">
                      Sr
                    </th>
                    <th className="border border-gray-400 p-2 text-left">
                      Description
                    </th>
                    <th className="border border-gray-400 p-2 text-right w-24">
                      Unit Price
                    </th>
                    <th className="border border-gray-400 p-2 text-center w-20">
                      QTY
                    </th>
                    <th className="border border-gray-400 p-2 text-right w-28">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(4)].map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="border border-gray-300 p-2">
                        {rowIndex + 1})
                      </td>
                      <td className="border border-gray-300 p-2">
                        {tableData[rowIndex]?.description || ""}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {tableData[rowIndex]?.unitPrice?.toFixed(2) || ""}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {tableData[rowIndex]?.quantity || ""}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {tableData[rowIndex]?.total?.toFixed(2) || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="grid grid-cols-2 gap-8 mb-8 z-50">
              {/* Thank You Section - static */}
              <div className="p-4 relative">
                <h3 className="font-semibold mb-2 text-gray-700">Thank You!</h3>
                <p className="text-sm text-gray-600">
                  Thank you for your trust in Techillusion. We value your business
                  and are committed to delivering exceptional service. Should you
                  require further assistance or wish to explore our offerings,
                  please do not hesitate to contact us.
                </p>
                <br />
                <p className="text-sm text-gray-600">
                  Visit our website at{" "}
                  <a
                    href="http://www.techillusion.com"
                    className="text-blue-600 underline"
                  >
                    www.techillusion.com
                  </a>{" "}
                  for more information about our services and updates.
                </p>
                
                <p className="text-sm text-gray-500 mt-4 italic">
                  This is a computer-generated invoice and does not require signature.
                </p>
              </div>

              <img 
                  src="/assets/stamp.png" 
                  alt="Official Stamp" 
                  className="absolute bottom-60 right-32 -rotate-12 w-32 h-auto object-contain opacity-90"
                />  

              {/* Totals - dynamic */}
              <div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Subtotal:</span>
                      <span className="text-gray-600">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    {discount >= 0 && ( // Only show discount if it's greater than 0
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Discount ({discount}%):
                        </span>
                        <span className="text-gray-600">
                          ${discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                      <span className="font-bold text-gray-800">Total Due:</span>
                      <span className="font-bold text-gray-800">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="w-full bg-white mt-auto print:absolute print:bottom-0 print:left-0">
            <img
              src="/assets/footer.png"
              alt="Company Footer"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
