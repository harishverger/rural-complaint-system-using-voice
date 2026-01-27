import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../../api/api';
import { getStrings } from '../../i18n';

const MyComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {strings.headerMyComplaints}
          </h1>
          <p className="text-gray-600">{strings.headerMyComplaintsSubtitle}</p>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    <p className="text-gray-800 mb-3 line-clamp-3">
                      {complaint.complaintText}
                    </p>

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
    </div>
  );
};

export default MyComplaints;
