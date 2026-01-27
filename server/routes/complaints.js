const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const axios = require('axios');

// Helper function to get address from coordinates using reverse geocoding
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RuralComplaintSystem/1.0'
        }
      }
    );

    const address = response.data.address || {};
    return {
      placeName: address.village || address.town || address.suburb || address.neighbourhood || 'Unknown',
      village: address.village || address.hamlet || address.suburb || '',
      district: address.county || address.state_district || '',
      state: address.state || '',
      pincode: address.postcode || '',
      fullAddress: response.data.display_name || ''
    };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return {
      placeName: 'Location',
      village: '',
      district: '',
      state: '',
      pincode: '',
      fullAddress: `${lat}, ${lng}`
    };
  }
};

// Helper function to detect category from complaint text
const detectCategory = (text) => {
  const lowerText = text.toLowerCase();
  
  const categories = {
    water: [
      'water', 'pipe', 'leak', 'leaking', 'leakage', 'drainage', 'drain', 'tap', 'supply', 'bore', 'well', 'pump', 'motor',
      'தண்ணீர்', 'தண்ணி', 'னீரு', 'குழாய்', 'கசிவு', 'வடிகால்',
      'నీరు', 'పైపు', 'కుళాయి', 'లీకేజ్', 'డ్రైనేజ్',
      'पानी', 'पाइप', 'नल', 'लीकेज', 'रिसाव', 'जल', 'जलापूर्ति',
      'thani', 'thaani', 'taani', 'kuzhay', 'kuzhai', 'neeru', 'paani'
    ],
    road: [
      'road', 'pothole', 'street', 'highway', 'damage', 'broken', 'crack', 'repair', 'construction', 'pathway', 'sidewalk',
      'சாலை', 'குழி', 'பாதை', 'தெரு', 'உடைந்த', 'சேதம்',
      'రోడ్డు', 'రోడ్', 'గుంట', 'దారి', 'పాతబడిన',
      'सड़क', 'रोड', 'गड्ढा', 'गड्ढे', 'रास्ता', 'मार्ग', 'टूटा',
      'salai', 'sarai', 'roddu', 'sadak', 'gunta', 'kuzhi', 'patha'
    ],
    health: [
      'health', 'hospital', 'doctor', 'clinic', 'medicine', 'medical', 'sick', 'disease', 'fever', 'pain', 'emergency', 'ambulance',
      'மருத்துவம்', 'மருத்துவமனை', 'டாக்டர்', 'வைத்தியம்', 'நோய்', 'வலி',
      'ఆరోగ్యం', 'ఆసుపత్రి', 'డాక్టర్', 'వైద్యం', 'అనారోగ్యం',
      'स्वास्थ्य', 'अस्पताल', 'डॉक्टर', 'दवा', 'बीमारी', 'दर्द', 'चिकित्सा',
      'maruthuvam', 'hospital', 'doctor', 'arogyam', 'vaidyam', 'swasthya'
    ],
    streetlight: [
      'light', 'street light', 'lamp', 'bulb', 'electricity', 'pole', 'dark', 'lighting', 'power', 'current', 'not working',
      'விளக்கு', 'தெரு விளக்கு', 'மின்சாரம்', 'இருட்டு', 'மின்',
      'లైట్', 'విద్యుత్', 'బల్బు', 'స్ట్రీట్ లైట్', 'చీకటి',
      'बत्ती', 'लाइट', 'बिजली', 'स्ट्रीट लाइट', 'अंधेरा', 'खम्भा',
      'vilakku', 'light', 'current', 'minsaram', 'vidyut', 'bijli', 'andhere'
    ],
    sanitation: [
      'garbage', 'waste', 'trash', 'dirt', 'clean', 'cleaning', 'dustbin', 'dump', 'litter', 'smell', 'toilet', 'drainage', 'sewer',
      'சுத்தம்', 'கழிவு', 'குப்பை', 'அழுக்கு', 'துப்புரவு', 'கழிப்பறை',
      'శుభ్రత', 'చెత్త', 'చెత్తబుట్ట', 'మురికి', 'శుభ్రపరచు',
      'सफाई', 'कचरा', 'गंदगी', 'कूड़ा', 'सफाई', 'शौचालय', 'नाली',
      'sutham', 'kuppai', 'chetha', 'kachara', 'gandagi', 'muriki', 'safai'
    ]
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  return 'other';
};

// Create Complaint
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('Received complaint submission:', {
      body: req.body,
      file: req.file ? req.file.filename : 'No file'
    });

    const { userId, complaintText, language, location } = req.body;

    // Validate required fields
    if (!userId || !complaintText || !language || !location) {
      console.error('Missing fields:', { 
        userId: !!userId, 
        complaintText: !!complaintText, 
        language: !!language, 
        location: !!location,
        receivedBody: req.body
      });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Parse location if it's a string
    let parsedLocation;
    try {
      if (typeof location === 'string') {
        parsedLocation = JSON.parse(location);
      } else {
        parsedLocation = location;
      }

      // Validate location has lat and lng
      if (!parsedLocation.lat || !parsedLocation.lng) {
        throw new Error('Location must have lat and lng properties');
      }
    } catch (parseError) {
      console.error('Location parse error:', parseError, 'Received:', location);
      return res.status(400).json({ message: 'Invalid location format', details: parseError.message });
    }

    // Auto-detect category
    const category = detectCategory(complaintText);

    // Get image URL if uploaded
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // Get address details from coordinates
    const addressDetails = await getAddressFromCoordinates(parsedLocation.lat, parsedLocation.lng);

    // Create complaint
    const complaint = new Complaint({
      userId,
      complaintText,
      category,
      language,
      location: parsedLocation,
      address: addressDetails,
      imageUrl,
      status: 'Open'
    });

    await complaint.save();

    console.log('Complaint saved successfully:', complaint._id);

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Failed to submit complaint', error: error.message });
  }
});

// Get All Complaints (Admin - Protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, status } = req.query;
    
    let filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    
    res.json({
      complaints,
      total: complaints.length
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
});

// Get User's Complaints
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const complaints = await Complaint.find({ userId }).sort({ createdAt: -1 });
    
    res.json({
      complaints,
      total: complaints.length
    });
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
});

// Update Complaint Status (Admin - Protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, volunteerAssigned } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (volunteerAssigned !== undefined) updateData.volunteerAssigned = volunteerAssigned;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ message: 'Failed to update complaint' });
  }
});

// Get Analytics (Admin - Protected)
router.get('/analytics/stats', authMiddleware, async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    
    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const byStatus = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      byCategory,
      byStatus
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

module.exports = router;
