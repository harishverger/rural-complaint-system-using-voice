import React from 'react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, complaintId, complaintText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="text-4xl">⚠️</div>
            <div>
              <h2 className="text-2xl font-bold">Confirm Deletion</h2>
              <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 text-lg mb-4">
            Are you sure you want to delete this complaint?
          </p>
          
          {/* Complaint Preview */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-500 font-semibold mb-1">Complaint ID:</p>
            <p className="font-mono text-sm text-purple-600 font-bold mb-3 break-all">
              {complaintId}
            </p>
            <p className="text-xs text-gray-500 font-semibold mb-1">Description:</p>
            <p className="text-sm text-gray-800 line-clamp-3">
              {complaintText}
            </p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <p className="text-red-800 text-sm font-semibold">
              ⚠️ Warning: This will permanently delete all complaint data including images and history.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all transform hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Yes, Delete
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}} />
    </div>
  );
};

export default DeleteConfirmModal;
