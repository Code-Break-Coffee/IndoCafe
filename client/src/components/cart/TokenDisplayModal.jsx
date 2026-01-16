import React, { useState } from 'react';
import { Copy, X } from 'lucide-react';
import toast from 'react-hot-toast';

const TokenDisplayModal = ({ customerToken, tableLabel, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(customerToken);
    setCopied(true);
    toast.success('Token copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Your Table Token</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">Table: {tableLabel}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Save this token to place additional orders at the same table
            </p>

            {/* Token Display */}
            <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-4 mb-4 font-mono text-lg font-bold text-blue-600 dark:text-blue-400 break-all">
              {customerToken}
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Copy size={18} />
              {copied ? 'Copied!' : 'Copy Token'}
            </button>
          </div>

          {/* Instructions */}
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                1
              </span>
              <p className="text-gray-700 dark:text-gray-300">Copy and save this token somewhere safe</p>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                2
              </span>
              <p className="text-gray-700 dark:text-gray-300">
                When you're ready to order more items, enter this token
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                3
              </span>
              <p className="text-gray-700 dark:text-gray-300">Select the same table and add more items to your order</p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenDisplayModal;
