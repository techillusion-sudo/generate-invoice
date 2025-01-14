// src/components/InvoiceModal.jsx
import { useState, useEffect } from "react";
import Modal from "./Modal";

const InvoiceModal = ({ isOpen, onClose, onSubmit, defaultInvoiceNumber }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    street: '',
    city: '',
    country: '',
    items: [{ description: '', quantity: 0, rate: 0, amount: 0 }]
  });

  // Update form when defaultInvoiceNumber changes
  useEffect(() => {
    if (defaultInvoiceNumber) {
      setFormData(prev => ({
        ...prev,
        invoiceNumber: defaultInvoiceNumber
      }));
    }
  }, [defaultInvoiceNumber]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        invoiceNumber: defaultInvoiceNumber,
        date: new Date().toISOString().split('T')[0],
        clientName: '',
        street: '',
        city: '',
        country: '',
        items: [{ description: '', quantity: 0, rate: 0, amount: 0 }]
      });
    }
  }, [isOpen, defaultInvoiceNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = parseFloat(newItems[index].quantity || 0) * parseFloat(newItems[index].rate || 0);
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 0, rate: 0, amount: 0 }]
    }));
  };

  const deleteItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.clientName.trim()) {
      alert('Please enter client name');
      return;
    }

    if (!formData.items.some(item => item.description && item.quantity && item.rate)) {
      alert('Please add at least one item with description, quantity, and price');
      return;
    }

    // Submit form
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to create invoice');
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Invoice">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Invoice Number</label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Client Information Section */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium mb-3">Client Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Client Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Enter client name"
                  className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Enter street address"
                  className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter country"
                    className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div>
          <h3 className="text-sm font-medium mb-3">Invoice Items</h3>
          <div>
            {/* Items Header */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6 text-sm text-gray-600">
                Description
              </div>
              <div className="col-span-2 text-sm text-gray-600">Quantity</div>
              <div className="col-span-2 text-sm text-gray-600">Price</div>
              <div className="col-span-2 text-sm text-gray-600">Amount</div>
            </div>

            {/* Items List */}
            <div className="space-y-2 mt-1">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-center relative"
                >
                  <input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    className="col-span-6 px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        parseInt(e.target.value)
                      )
                    }
                    className="col-span-2 px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.rate}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "rate",
                        parseFloat(e.target.value)
                      )
                    }
                    className="col-span-2 px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    disabled
                    className="col-span-2 px-3 py-1.5 border rounded bg-gray-50"
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteItem(index)}
                      className="absolute -right-6 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              + Add New Item
            </button>
          </div>
        </div>

        {/* Footer Actions */}

        {/* Footer Actions */}
        <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border text-sm font-medium rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
          >
            Create Invoice
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InvoiceModal;
