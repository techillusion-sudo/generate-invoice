"use client";
import React, { useEffect, useState } from "react";

const Invoice = ({ params }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Rest of your JSX remains exactly the same...
  return (
    <div className="print-wrapper flex justify-center items-center bg-gray-200 p-10">
      <div
        id="invoice"
        className="min-h-screen bg-white text-black light print:min-h-[297mm] print:w-[210mm] w-[210mm] print:m-0 print:p-0 relative flex flex-col"
      >
        {/* Your existing JSX remains unchanged */}
        {/* Just updating the dynamic data parts */}

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
                Bill To:
              </h3>
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">Client Name: </span>{" "}
                {invoice?.clientName || "Client Name"}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">Client Address: </span>
                {invoice?.city
                  ? `${invoice.street}, ${invoice.city}, ${invoice.country}`
                  : "Client Address"}
              </p>
              <p className="text-gray-600 text-sm">
                {" "}
                <span className="font-semibold">Client Contact Info: </span>
                {invoice?.clientContact || "Client Contact Info"}
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
            <div className="p-4">
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
            </div>

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
  );
};

export default Invoice;
