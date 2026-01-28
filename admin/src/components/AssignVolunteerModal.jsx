import React, { useState, useEffect } from 'react';

const AssignVolunteerModal = ({ isOpen, onClose, onSubmit, complaintId, mode = 'assign', currentVolunteerName = '' }) => {
  const [volunteerName, setVolunteerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');
  const [actionType, setActionType] = useState('assign'); // 'assign' or 'changed'

  // Set initial volunteer name when mode is 'change'
  useEffect(() => {
    if (mode === 'change' && currentVolunteerName) {
      setVolunteerName(currentVolunteerName);
      setActionType('changed');
    } else {
      setVolunteerName('');
      setActionType('assign');
    }
  }, [mode, currentVolunteerName, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!volunteerName.trim()) {
      return;
    }
    setIsSubmitting(true);
    await onSubmit(complaintId, volunteerName.trim());
    setSuccessName(volunteerName.trim());
    setShowSuccess(true);
    setIsSubmitting(false);
    
    // Close modal after showing success for 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setVolunteerName('');
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setVolunteerName('');
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  // Success Screen
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-scaleIn">
          <div className="p-8 text-center">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-3xl font-bold text-green-600 mb-3">
              ✓ Success!
            </h2>
            <p className="text-xl text-gray-700 font-semibold mb-2">
              Volunteer {actionType === 'changed' ? 'Changed' : 'Assigned'}
            </p>
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200 mb-4">
              <p className="text-gray-600 text-sm mb-1">{actionType === 'changed' ? 'New volunteer:' : 'Assigned to:'}</p>
              <p className="text-green-700 font-bold text-lg">{successName}</p>
            </div>
            <p className="text-gray-500 text-sm">
              ⏳ Closing in a moment...
            </p>
          </div>

          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            @keyframes scaleIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }

            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out;
            }

            .animate-scaleIn {
              animation: scaleIn 0.3s ease-out;
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl px-6 py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">{mode === 'change' ? '✏️' : '👤'}</span>
              {mode === 'change' ? 'Change Volunteer' : 'Assign Volunteer'}
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {mode === 'change' ? 'New Volunteer Name' : 'Volunteer Name'}
            </label>
            <input
              type="text"
              value={volunteerName}
              onChange={(e) => setVolunteerName(e.target.value)}
              placeholder={mode === 'change' ? 'Enter new volunteer name' : "Enter volunteer's full name"}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-all placeholder:text-gray-400 disabled:bg-gray-100"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              {mode === 'change' ? 'Replace the current volunteer with a new one.' : 'This volunteer will be assigned to handle this complaint.'}
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !volunteerName.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  {mode === 'change' ? 'Changing...' : 'Assigning...'}
                </>
              ) : (
                <>
                  <span>✓</span>
                  {mode === 'change' ? 'Change' : 'Assign'}
                </>
              )}
            </button>
          </div>
        </form>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }

          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AssignVolunteerModal;
