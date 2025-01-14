"use client"
import React from 'react';
import { useSearchParams } from 'next/navigation';

const Invoice = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const tableData = [
        {
            description: "We are offering you rooms for 200 pax including Water, Electricity and Gas. One time payment",
            unitPrice: 250.00,
            quantity: 200,
            discount: "5%",
            total: 50000.00
        },
        {
            description: "Additional cleaning service",
            unitPrice: 100.00,
            quantity: 4,
            discount: "5%",
            total: 400.00
        }
    ];

    // Add payment and invoice status
    const invoiceStatus = "UNPAID";
    const paymentDetails = {
        bank: "ABC Bank",
        accountName: "Techillusion",
        accountNumber: "1234-5678-9012-3456",
        swiftCode: "ABCDPKXX",
        iban: "PK36ABCD1234567890123456"
    };

    // Add invoice metadata
    const invoiceData = {
        number: "INV-2024-001",
        date: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        terms: "Net 30"
    };

    React.useEffect(() => {
        // Add print-specific styles
        const style = document.createElement('style');
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
                /* Hide the outer wrapper during print */
                .print-wrapper {
                    padding: 0 !important;
                    background: none !important;
                }
                /* Ensure the invoice takes full page */
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

    return (
        <div className="print-wrapper flex justify-center items-center bg-gray-200 p-10">
            <div id="invoice" className="min-h-screen bg-white text-black light print:min-h-[297mm] print:w-[210mm] w-[210mm] print:m-0 print:p-0 relative flex flex-col">
                {/* Header */}
                <div className="w-full bg-white -mt-1 relative">
                    <img src="/assets/header.png" alt="Company Logo" className="w-full h-auto object-contain" />
                    {/* Add status overlay */}
                    {/* <div className="absolute top-10 right-10 -rotate-12">
                        <div className="border-4 border-red-500 rounded-xl px-6 py-2">
                            <span className="text-red-500 text-2xl font-bold">{invoiceStatus}</span>
                        </div>
                    </div> */}
                </div>

                {/* Main Content */}
                <div className="w-full max-w-4xl mx-auto px-10 print:max-w-none">
                    {/* Invoice Details - Enhanced design */}
                    <div className="flex justify-end items-start mb-8">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h1>
                            <div className="text-sm text-gray-600">
                                <p className="font-medium">Invoice #: {invoiceData.number}</p>
                                <p>Invoice Date: {invoiceData.date}</p>
                                {/* <p>Due Date: {invoiceData.dueDate}</p>
                            <p>Payment Terms: {invoiceData.terms}</p> */}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Billing Information */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="p-4 bg-[#e6e6e5] rounded-lg">
                            <h3 className="font-semibold mb-2 text-gray-700 text-lg">From:</h3>
                            <p className="text-gray-600 text-sm">Techillusion</p>
                            <p className="text-gray-600 text-sm">Shama Colony Begum Kot Shahdrah Lahore</p>
                            <p className="text-gray-600 text-sm">Phone: +92 333 4303325</p>
                            <p className="text-gray-600 text-sm">Email: official.techillusion@gmail.com</p>
                        </div>
                        <div className="p-4 bg-[#e6e6e5] rounded-lg">
                            <h3 className="font-semibold mb-2 text-gray-700 text-lg">Bill To:</h3>
                            <p className="text-gray-600 text-sm">Client Name</p>
                            <p className="text-gray-600 text-sm">Client Address</p>
                            <p className="text-gray-600 text-sm">Client Contact Info</p>
                        </div>
                    </div>

                    {/* Enhanced Table */}
                    <div className="mb-8 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#e6e6e5] border-none">
                                    <th className="border border-gray-400 p-2 text-left w-12">Sr</th>
                                    <th className="border border-gray-400 p-2 text-left">Description</th>
                                    <th className="border border-gray-400 p-2 text-right w-24">Unit Price</th>
                                    <th className="border border-gray-400 p-2 text-center w-20">QTY</th>
                                    <th className="border border-gray-400 p-2 text-right w-28">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(4)].map((_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        <td className="border border-gray-300 p-2">{rowIndex + 1})</td>
                                        <td className="border border-gray-300 p-2">{tableData[rowIndex]?.description || ''}</td>
                                        <td className="border border-gray-300 p-2 text-right">
                                            {tableData[rowIndex]?.unitPrice?.toFixed(2) || ''}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">{tableData[rowIndex]?.quantity || ''}</td>
                                        <td className="border border-gray-300 p-2 text-right">
                                            {tableData[rowIndex]?.total?.toFixed(2) || ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Enhanced Totals and Payment Details */}
                    <div className="grid grid-cols-2 gap-8 mb-8 z-50">
                        <div className="p-4">
                            <h3 className="font-semibold mb-2 text-gray-700">Thank You!</h3>
                            {/* <p className="text-sm text-gray-600">We appreciate your business and look forward to serving you again.</p> */}
                            <p className="text-sm text-gray-600">Thank you for your trust in Techillusion. We value your business and are committed to delivering exceptional service. Should you require further assistance or wish to explore our offerings, please do not hesitate to contact us.</p>
                            <br/>
                            <p className="text-sm text-gray-600">Visit our website at <a href="http://www.techillusion.com" className="text-blue-600 underline">www.techillusion.com</a> for more information about our services and updates.</p>
                        </div>
                        <div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-700">Subtotal:</span>
                                        <span className="text-gray-600">$50,400.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-700">Discount:</span>
                                        <span className="text-gray-600">$2,520.00</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                                        <span className="font-bold text-gray-800">Total Due:</span>
                                        <span className="font-bold text-gray-800">$52,920.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Notes and Terms */}
                    {/* <div className="mb-8">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-semibold mb-2 text-gray-700">Notes & Terms:</h3>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                            <li>Payment is due within 30 days</li>
                            <li>Please include invoice number on your payment</li>
                            <li>Late payments are subject to a 5% monthly fee</li>
                        </ul>
                    </div>
                </div> */}
                </div>

                {/* Footer */}
                <div className="w-full bg-white mt-auto print:absolute print:bottom-0 print:left-0">
                    <img src="/assets/footer.png" alt="Company Footer" className="w-full h-auto object-contain" />
                </div>
            </div>
        </div>
    );
};

export default Invoice;