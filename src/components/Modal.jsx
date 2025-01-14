// src/components/Modal.jsx
import React from 'react';

const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-[800px] max-h-[90vh] flex flex-col"> {/* Increased width to 800px */}
          <div className="px-6 py-3 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };
export default Modal;