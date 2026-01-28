import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../../api/api';
import { getStrings } from '../../i18n';

const MyComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [editText, setEditText] = useState('');
  const [banner, setBanner] = useState({ type: '', message: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingComplaint, setDeletingComplaint] = useState(null);
  const uiLanguage = localStorage.getItem('uiLanguage') || 'English';
  const strings = getStrings(uiLanguage);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setComplaints([]);
        setLoading(false);
        return;
      }

      const response = await complaintAPI.getUserComplaints(userId);
      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      alert(strings.loadFail);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComplaint = async () => {
    if (!deletingComplaint) return;

    try {
      const userId = localStorage.getItem('userId');
      console.log('Deleting complaint:', deletingComplaint._id);
      const response = await complaintAPI.deleteUserComplaint(deletingComplaint._id, userId);
      console.log('Delete response:', response.data);
      
      setShowDeleteModal(false);
      setDeletingComplaint(null);
      await fetchComplaints();
      
      setBanner({ type: 'success', message: '✓ Complaint deleted successfully!' });
      setTimeout(() => setBanner({ type: '', message: '' }), 2500);
    } catch (error) {
      console.error('Error deleting complaint:', error);
      console.error('Error response:', error.response?.data);
      setShowDeleteModal(false);
      setDeletingComplaint(null);
      setBanner({ type: 'error', message: 'Failed to delete complaint: ' + (error.response?.data?.message || error.message) });
      setTimeout(() => setBanner({ type: '', message: '' }), 3000);
    }
  };

  const handleOpenDeleteModal = (complaint) => {
    setDeletingComplaint(complaint);
    setShowDeleteModal(true);
  };

  const handleStartEdit = (complaint) => {
    setEditingComplaint(complaint._id);
    setEditText(complaint.complaintText);
  };

  const handleCancelEdit = () => {
    setEditingComplaint(null);
    setEditText('');
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) {
      alert('Complaint text cannot be empty');
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      const language = complaints.find(c => c._id === id)?.language || 'English';
      await complaintAPI.updateUserComplaint(id, {
        userId,
        complaintText: editText.trim(),
        language
      });
      await fetchComplaints();
      setEditingComplaint(null);
      setEditText('');
      setBanner({ type: 'success', message: '✓ Complaint updated successfully!' });
      setTimeout(() => setBanner({ type: '', message: '' }), 2500);
    } catch (error) {
      console.error('Error updating complaint:', error);
      setBanner({ type: 'error', message: 'Failed to update complaint' });
      setTimeout(() => setBanner({ type: '', message: '' }), 3000);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
      'Resolved': 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      water: '💧',
      road: '🛣️',
      health: '🏥',
      streetlight: '💡',
      sanitation: '🗑️',
      other: '📝'
    };
    return icons[category] || '📝';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      water: 'Water Supply',
      road: 'Road Issue',
      health: 'Health',
      streetlight: 'Street Light',
      sanitation: 'Sanitation',
      other: 'Other'
    };
    return labels[category] || 'Other';
  };

  const filteredComplaints = filter === 'all'
    ? complaints
    : complaints.filter(c => c.status === filter);

  const getStatusLabel = (status) => {
    const labels = {
      'Open': strings.filterOpen,
      'In Progress': strings.filterInProgress,
      'Resolved': strings.filterResolved
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Banner */}
        {banner.message && (
          <div className={`w-full ${banner.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border-2 rounded-lg px-3 sm:px-4 py-2 sm:py-3 mb-4 sm:mb-6 mt-2 sm:mt-4`}>
            <p className="font-medium text-sm sm:text-base">{banner.message}</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {strings.headerMyComplaints}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">{strings.headerMyComplaintsSubtitle}</p>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                filter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200 sm:hover:bg-gray-200'
              }`}
            >
              {strings.filterAll} ({complaints.length})
            </button>
            <button
              onClick={() => setFilter('Open')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'Open'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {strings.filterOpen} ({complaints.filter(c => c.status === 'Open').length})
            </button>
            <button
              onClick={() => setFilter('In Progress')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'In Progress'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {strings.filterInProgress} ({complaints.filter(c => c.status === 'In Progress').length})
            </button>
            <button
              onClick={() => setFilter('Resolved')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'Resolved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {strings.filterResolved} ({complaints.filter(c => c.status === 'Resolved').length})
            </button>
          </div>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-gray-600">{strings.loadingComplaints}</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {strings.noComplaintsTitle}
            </h3>
            <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? strings.noComplaintsAll
                  : strings.noComplaintsFiltered(getStatusLabel(filter))}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all"
            >
                {strings.submitNewComplaint}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Main Content */}
                  <div className="flex-1">
                    {/* Complaint ID */}
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <p className="text-xs text-gray-500 font-semibold">Complaint ID</p>
                      <p className="font-mono text-sm font-bold text-purple-600 break-all">
                        {complaint._id}
                      </p>
                    </div>

                    {/* Category & Status */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        <span className="text-lg mr-2">{getCategoryIcon(complaint.category)}</span>
                        {getCategoryLabel(complaint.category)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(complaint.status)}`}>
                        {getStatusLabel(complaint.status)}
                      </span>
                    </div>

                    {/* Complaint Text */}
                    {editingComplaint === complaint._id ? (
                      <div className="mb-3">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                          rows="3"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSaveEdit(complaint._id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-800 mb-3 line-clamp-3">
                        {complaint.complaintText}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>📅 {formatDate(complaint.createdAt)}</span>
                      <span>🌐 {complaint.language}</span>
                      {complaint.address?.district && (
                        <span>📍 {complaint.address.village || complaint.address.placeName}, {complaint.address.district}</span>
                      )}
                      {complaint.address?.pincode && (
                        <span>📮 {complaint.address.pincode}</span>
                      )}
                      {complaint.volunteerAssigned && (
                        <span>👤 Assigned to: {complaint.volunteerAssigned}</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {!editingComplaint && complaint.status === 'Open' && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={() => handleStartEdit(complaint)}
                          className="flex-1 min-w-[120px] px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg active:bg-blue-600 sm:hover:bg-blue-600 transition-all font-semibold text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(complaint)}
                          className="flex-1 min-w-[120px] px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg active:bg-red-600 sm:hover:bg-red-600 transition-all font-semibold text-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Image Thumbnail */}
                  {complaint.imageUrl && (
                    <div className="md:w-32 md:h-32 w-full h-48">
                      <img
                        src={`http://localhost:5000${complaint.imageUrl}`}
                        alt="Complaint"
                        className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            {strings.backToHome}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingComplaint && (
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
                  {deletingComplaint._id}
                </p>
                <p className="text-xs text-gray-500 font-semibold mb-1">Description:</p>
                <p className="text-sm text-gray-800 line-clamp-3">
                  {deletingComplaint.complaintText}
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-red-800 text-sm font-semibold">
                  ⚠️ Warning: This will permanently delete your complaint data.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingComplaint(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComplaint}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Yes, Delete
              </button>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
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
      )}
    </div>
  );
};

export default MyComplaints;
