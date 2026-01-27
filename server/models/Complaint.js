const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  complaintText: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['water', 'road', 'health', 'streetlight', 'sanitation', 'other'],
    required: true
  },
  language: {
    type: String,
    enum: ['Tamil', 'Telugu', 'Hindi', 'English'],
    required: true
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  address: {
    placeName: String,
    village: String,
    district: String,
    state: String,
    pincode: String,
    fullAddress: String
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  },
  volunteerAssigned: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
