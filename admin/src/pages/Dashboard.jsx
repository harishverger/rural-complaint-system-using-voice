import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../api/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [analytics, setAnalytics] = useState({ total: 0, byCategory: [], byStatus: [] });
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [banner, setBanner] = useState({ type: '', message: '' });

  // Derive API origin for static assets (uploads)
  const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [complaints, categoryFilter, statusFilter]);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
    }
  };

  const fetchData = async () => {
    try {
      const [complaintsRes, analyticsRes] = await Promise.all([
        complaintAPI.getAllComplaints({}),
        complaintAPI.getAnalytics()
      ]);

      setComplaints(complaintsRes.data.complaints || []);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = complaints;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    setFilteredComplaints(filtered);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await complaintAPI.updateComplaint(id, { status: newStatus });
      await fetchData();
      setBanner({ type: 'success', message: 'Status updated successfully' });
      setTimeout(() => setBanner({ type: '', message: '' }), 2500);
    } catch (error) {
      console.error('Error updating status:', error);
      setBanner({ type: 'error', message: 'Failed to update status' });
      setTimeout(() => setBanner({ type: '', message: '' }), 3000);
    }
  };

  const handleVolunteerAssign = async (id) => {
    const volunteerName = prompt('Enter volunteer name:');
    if (volunteerName && volunteerName.trim()) {
      try {
        const response = await complaintAPI.updateComplaint(id, { volunteerAssigned: volunteerName.trim() });
        if (response.data) {
          await fetchData();
          setBanner({ type: 'success', message: 'Volunteer assigned successfully' });
          setTimeout(() => setBanner({ type: '', message: '' }), 2500);
        }
      } catch (error) {
        console.error('Error assigning volunteer:', error);
        setBanner({ type: 'error', message: 'Failed to assign volunteer' });
        setTimeout(() => setBanner({ type: '', message: '' }), 3000);
      }
    } else if (volunteerName !== null) {
      setBanner({ type: 'error', message: 'Please enter a valid volunteer name' });
      setTimeout(() => setBanner({ type: '', message: '' }), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/login');
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

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Resolved': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  const getCategoryCount = (category) => {
    const cat = analytics.byCategory.find(c => c._id === category);
    return cat ? cat.count : 0;
  };

  const getStatusCount = (status) => {
    const stat = analytics.byStatus.find(s => s._id === status);
    return stat ? stat.count : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Banner */}
      {banner.message && (
        <div className={`w-full ${banner.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} border-b ${banner.type === 'success' ? 'border-green-200' : 'border-red-200'} py-2` }>
          <div className="max-w-7xl mx-auto px-4 text-sm font-medium">
            {banner.message}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-purple-100 mt-1">
                Welcome, {localStorage.getItem('adminEmail')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Complaints</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.total}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Open</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{getStatusCount('Open')}</p>
              </div>
              <div className="text-4xl">🔔</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{getStatusCount('In Progress')}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Resolved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{getStatusCount('Resolved')}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Complaints by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {['water', 'road', 'health', 'streetlight', 'sanitation', 'other'].map((cat) => (
              <div key={cat} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl mb-2">{getCategoryIcon(cat)}</div>
                <p className="text-sm text-gray-600 capitalize">{cat}</p>
                <p className="text-2xl font-bold text-gray-800">{getCategoryCount(cat)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="water">Water Supply</option>
                <option value="road">Road Issue</option>
                <option value="health">Health</option>
                <option value="streetlight">Street Light</option>
                <option value="sanitation">Sanitation</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Complaints List ({filteredComplaints.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complaint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volunteer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-purple-600 font-mono font-bold">
                      {complaint._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(complaint.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center text-sm">
                        <span className="text-xl mr-2">{getCategoryIcon(complaint.category)}</span>
                        <span className="capitalize">{complaint.category}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 max-w-md">
                      <div className="line-clamp-2">{complaint.complaintText}</div>
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="text-purple-600 hover:text-purple-800 text-xs mt-1"
                      >
                        View Details →
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={complaint.status}
                        onChange={(e) => handleStatusUpdate(complaint._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(complaint.status)} border-none cursor-pointer`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {complaint.volunteerAssigned || (
                        <button
                          onClick={() => handleVolunteerAssign(complaint._id)}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          + Assign
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredComplaints.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600">No complaints found with selected filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Complaint Details</h2>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-500 hover:text-gray-700 text-3xl"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                  <label className="font-semibold text-gray-700 text-sm">Complaint ID:</label>
                  <div className="flex items-start gap-3 mt-1">
                    <p className="font-mono font-bold text-purple-600 text-lg break-all">{selectedComplaint._id}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedComplaint._id);
                        setBanner({ type: 'success', message: 'Complaint ID copied' });
                        setTimeout(() => setBanner({ type: '', message: '' }), 1500);
                      }}
                      className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Category:</label>
                  <p className="text-gray-800 flex items-center mt-1">
                    <span className="text-2xl mr-2">{getCategoryIcon(selectedComplaint.category)}</span>
                    <span className="capitalize">{selectedComplaint.category}</span>
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Complaint:</label>
                  <p className="text-gray-800 mt-1">{selectedComplaint.complaintText}</p>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Status:</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Language:</label>
                  <p className="text-gray-800 mt-1">{selectedComplaint.language}</p>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Submitted:</label>
                  <p className="text-gray-800 mt-1">{formatDate(selectedComplaint.createdAt)}</p>
                </div>

                {selectedComplaint.volunteerAssigned && (
                  <div>
                    <label className="font-semibold text-gray-700">Assigned to:</label>
                    <p className="text-gray-800 mt-1">{selectedComplaint.volunteerAssigned}</p>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-gray-700">Location:</label>
                  <p className="text-gray-800 mt-1">
                    Lat: {selectedComplaint.location.lat.toFixed(6)}, Lng: {selectedComplaint.location.lng.toFixed(6)}
                  </p>
                  {selectedComplaint.address && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      {selectedComplaint.address.placeName && (
                        <p className="text-gray-800"><strong>Place:</strong> {selectedComplaint.address.placeName}</p>
                      )}
                      {selectedComplaint.address.village && (
                        <p className="text-gray-800"><strong>Village:</strong> {selectedComplaint.address.village}</p>
                      )}
                      {selectedComplaint.address.district && (
                        <p className="text-gray-800"><strong>District:</strong> {selectedComplaint.address.district}</p>
                      )}
                      {selectedComplaint.address.state && (
                        <p className="text-gray-800"><strong>State:</strong> {selectedComplaint.address.state}</p>
                      )}
                      {selectedComplaint.address.pincode && (
                        <p className="text-gray-800"><strong>Pincode:</strong> {selectedComplaint.address.pincode}</p>
                      )}
                    </div>
                  )}
                  <div className="mt-2 h-64 rounded-lg overflow-hidden">
                    <MapContainer
                      center={[selectedComplaint.location.lat, selectedComplaint.location.lng]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <Marker position={[selectedComplaint.location.lat, selectedComplaint.location.lng]}>
                        <Popup>Complaint Location</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>

                {selectedComplaint.imageUrl && (
                  <div>
                    <label className="font-semibold text-gray-700">Photo:</label>
                    <img
                      src={`${API_ORIGIN}${selectedComplaint.imageUrl}`}
                      alt="Complaint"
                      className="mt-2 w-full h-auto rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
