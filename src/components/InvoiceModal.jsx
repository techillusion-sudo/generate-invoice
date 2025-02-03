// src/components/InvoiceModal.jsx
"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";

const InvoiceModal = ({
  isOpen,
  onClose,
  onSubmit,
  defaultInvoiceNumber,
  isLoading,
  currencies,
}) => {
  const ReferralOptions = ["Ali Raza", "Muneeb Ahmad", "Other"];
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    street: "",
    city: "",
    country: "",
    currencyCode: "USD",
    referredBy: "",
    customReferral: "",
    discount: 0,

    items: [],
  });

  const [newItem, setNewItem] = useState({
    description: "",
    quantity: "",
    rate: "",
  });

  useEffect(() => {
    if (defaultInvoiceNumber) {
      setFormData((prev) => ({ ...prev, invoiceNumber: defaultInvoiceNumber }));
    }
  }, [defaultInvoiceNumber]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    if (!newItem.description || !newItem.quantity || !newItem.rate) {
      alert("Please fill all item fields");
      return;
    }

    const amount = parseFloat(newItem.quantity) * parseFloat(newItem.rate);
    const updatedItems = [...formData.items, { ...newItem, amount }];

    setFormData((prev) => ({ ...prev, items: updatedItems }));
    setNewItem({
      description: "",
      quantity: "",
      rate: "",
    });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const calculateTotals = () => {
    const symbol = currencies[formData.currencyCode].symbol;
    const subtotal = formData.items.reduce(
      (sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.rate),
      0
    );
    const discount = (subtotal * (parseFloat(formData.discount) || 0)) / 100;
    const total = subtotal - discount;

    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
      symbol,
    };
  };

 // Modify the handleSubmit function to include the correct referral value
const handleSubmit = (e) => {
  e.preventDefault();
  if (formData.items.length === 0) {
    alert('Please add at least one item');
    return;
  }

  // Prepare the submission data
  const submissionData = {
    ...formData,
    referredBy: formData.referredBy === 'Other' ? formData.customReferral : formData.referredBy
  };

  // Remove customReferral from the submission
  delete submissionData.customReferral;
  
  onSubmit(submissionData);
};

  const resetForm = () => {
    setFormData({
      invoiceNumber: defaultInvoiceNumber || "",
      date: new Date().toISOString().split("T")[0],
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      street: "",
      city: "",
      country: "",
      currencyCode: "USD",
      discount: 0,
      items: [],
    });
    setNewItem({
      description: "",
      quantity: "",
      rate: "",
    });
  };

  const totals = calculateTotals();

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetForm();
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Create New Invoice</h2>

        {/* Invoice Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              readOnly
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Currency Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Currency</label>
          <select
            name="currencyCode"
            value={formData.currencyCode}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            {Object.entries(currencies).map(([code, currency]) => (
              <option key={code} value={code}>
                {code} - {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Referred By
            </label>
            <select
              name="referredBy"
              value={formData.referredBy}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  referredBy: value,
                  customReferral: value === "Other" ? prev.customReferral : "",
                }));
              }}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Referral</option>
              {ReferralOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {formData.referredBy === "Other" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Custom Referral Name
              </label>
              <input
                type="text"
                name="customReferral"
                value={formData.customReferral}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    customReferral: e.target.value,
                  }));
                }}
                className="w-full p-2 border rounded"
                placeholder="Enter referral name"
                required={formData.referredBy === "Other"}
              />
            </div>
          )}
        </div>

        {/* Client Details Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Client Name
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Client Email
              </label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Client Phone
              </label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Street Address
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Items</h3>

          {/* New Item Input */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={newItem.description}
                onChange={handleNewItemChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={handleNewItemChange}
                className="w-full p-2 border rounded"
                min="1"
              />
            </div>
            <div>
              <div className="relative">
                <span className="absolute left-3 top-2">
                  {currencies[formData.currencyCode].symbol}
                </span>
                <input
                  type="number"
                  name="rate"
                  placeholder="Rate"
                  value={newItem.rate}
                  onChange={handleNewItemChange}
                  className="w-full p-2 pl-6 border rounded"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Item
          </button>

          {/* Items Table */}
          {formData.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                    <th className="px-4 py-2 text-right">Rate</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{item.description}</td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">
                        {currencies[formData.currencyCode].symbol}
                        {parseFloat(item.rate).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {currencies[formData.currencyCode].symbol}
                        {(item.quantity * item.rate).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totals Section */}
        <div className="space-y-2 mt-4">
          <div className="flex justify-end items-center space-x-2">
            <span className="font-medium">Subtotal:</span>
            <span>
              {totals.symbol}
              {totals.subtotal}
            </span>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <label className="text-sm font-medium">Discount (%):</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              className="w-24 p-2 border rounded"
              min="0"
              max="100"
              step="0.1"
            />
            <span>
              {totals.symbol}
              {totals.discount}
            </span>
          </div>

          <div className="flex justify-end items-center space-x-2 text-lg font-bold">
            <span>Total:</span>
            <span>
              {totals.symbol}
              {totals.total}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="px-4 py-2 border rounded hover:bg-gray-100"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InvoiceModal;
