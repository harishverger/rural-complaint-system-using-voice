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
        },
        timeout: 10000 // 10 second timeout
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
  // Normalize Unicode characters for proper Tamil/Telugu matching
  const normalizedText = text.normalize('NFC');
  const lowerText = normalizedText.toLowerCase();
  
  const categories = {
    streetlight: [
      // English
      'light', 'street light', 'lamp', 'bulb', 'electricity', 'pole', 'dark', 'lighting', 'power', 'current', 
      'electric', 'electrical', 'no light', 'no electricity', 'no current', 'no power', 'power cut', 'load shedding',
      'not working', 'streetlight', 'street lamp', 'power supply', 'energy', 'voltage', 'no voltage',
      // Hindi - with all variations
      'विद्युत', 'करंट', 'लाइट', 'बिजली', 'बत्ती', 'स्ट्रीट लाइट', 'अंधेरा', 'खम्भा', 'इलेक्ट्रिसिटी', 'पावर',
      'करेंट नहीं', 'बिजली नहीं', 'लाइट नहीं', 'बिजली का', 'बिजली की', 'करेंट नही', 'बिजली नही',
      'घर में करंट नहीं', 'घर में बिजली नहीं', 'करंट आ नहीं रहा', 'बिजली आ नहीं रही',
      'विद्युत नहीं', 'पावर नहीं', 'करंट गया', 'बिजली गई', 'बिजली चली गई',
      // Tamil - with all variations
      'விளக்கு', 'தெரு விளக்கு', 'மின்சாரம்', 'இருட்டு', 'மின்', 'கரண்ட்', 'மின் வசதி',
      'மின்சாரம் இல்லை', 'கரண்ட் இல்லை', 'விளக்கு வேலை செய்யவில்லை', 'இருட்டாக உள்ளது',
      'மின் விளக்கு', 'தெருவிளக்கு', 'மின் தடை', 'மின்சார தடை',
      // Telugu - with all variations
      'లైట్', 'విద్యుత్', 'బల్బు', 'స్ట్రీట్ లైట్', 'చీకటి', 'కరెంట్', 'కరంటు',
      'కరెంట్ లేదు', 'విద్యుత్ లేదు', 'లైట్ లేదు', 'కరెంట్ రావడం లేదు',
      'ఇంట్లో కరెంట్ లేదు', 'విద్యుత్ వెలుతురు', 'విద్యుత్ సరఫరా',
      // Romanized/Transliterated versions
      'vilakku', 'minsaram', 'vidyut', 'bijli', 'andhere', 'kurrent', 'current nahi', 'bijli nahi',
      'karant', 'karunt', 'vidyuth', 'vidyut ledu', 'light ledu', 'current ledu',
      'ghar mein current nahi', 'bijli nahi aa rahi', 'current gaya', 'bijli gayi'
    ],
    water: [
      // English
      'water', 'pipe', 'leak', 'leaking', 'leakage', 'drainage', 'drain', 'tap', 'supply', 'bore', 'well', 'pump', 'motor', 'valve',
      'water supply', 'water problem', 'no water', 'water shortage',
      // Hindi
      'पानी', 'पाइप', 'नल', 'लीकेज', 'रिसाव', 'जल', 'जलापूर्ति', 'पानी का', 'पानी की',
      'पानी नहीं', 'पानी आ नहीं रहा', 'नल में पानी नहीं', 'पानी की समस्या',
      // Tamil
      'தண்ணீர்', 'தண்ணி', 'னீரு', 'குழாய்', 'கசிவு', 'வடிகால்', 'தண்ணீர் இல்லை',
      'குழாய் வேலை செய்யவில்லை', 'தண்ணீர் வசதி', 'தண்ணீர் சப்ளை',
      // Telugu
      'నీరు', 'పైపు', 'కుళాయి', 'లీకేజ్', 'డ్రైనేజ్', 'నీరు లేదు', 'నీటి సరఫరా',
      'కుళాయి పని చేయడం లేదు', 'నీటి సమస్య',
      // Romanized
      'thani', 'thaani', 'taani', 'kuzhay', 'kuzhai', 'neeru', 'paani', 'paani nahi'
    ],
    road: [
      // English
      'road', 'pothole', 'street', 'highway', 'damage', 'broken', 'crack', 'repair', 'construction', 'pathway', 'sidewalk',
      'road damage', 'road broken', 'bad road', 'road problem',
      // Hindi
      'सड़क', 'रोड', 'गड्ढा', 'गड्ढे', 'रास्ता', 'मार्ग', 'टूटा', 'सड़क खराब', 'रोड खराब',
      'सड़क टूटी', 'रास्ता खराब', 'गड्ढे हैं',
      // Tamil
      'சாலை', 'குழி', 'பாதை', 'தெரு', 'ரோடு', 'வீதி', 'உடைந்த', 'சேதம்', 'சாலை சேதம்', 'குழிகள்',
      'சாலை உடைந்துள்ளது', 'சாலை பழுது', 'ரோடு சேதம்', 'தெரு சேதம்', 'வீதி சேதம்',
      // Telugu
      'రోడ్డు', 'రోడ్', 'గుంట', 'దారి', 'పాతబడిన', 'రోడ్డు పాడు', 'గుంతలు',
      'రోడ్డు చెడిపోయింది', 'రోడ్డు సమస్య',
      // Romanized
      'salai', 'saalai', 'theru', 'theruvil', 'rodu', 'veethi', 'veedhi', 'paadhai',
      'roddu', 'sadak', 'gunta', 'kuzhi', 'patha', 'sadak kharab', 'rodu sedam'
    ],
    health: [
      // English
      'health', 'hospital', 'doctor', 'clinic', 'medicine', 'medical', 'sick', 'disease', 'fever', 'pain', 'emergency', 'ambulance',
      'health problem', 'health issue', 'medical emergency',
      // Hindi
      'स्वास्थ्य', 'अस्पताल', 'डॉक्टर', 'दवा', 'बीमारी', 'दर्द', 'चिकित्सा', 'एम्बुलेंस',
      'बीमार', 'बुखार', 'स्वास्थ्य समस्या', 'इलाज',
      // Tamil
      'மருத்துவம்', 'மருத்துவமனை', 'டாக்டர்', 'வைத்தியம்', 'நோய்', 'வலி', 'மருந்து',
      'உடல்நலம்', 'காய்ச்சல்', 'மருத்துவ உதவி',
      // Telugu
      'ఆరోగ్యం', 'ఆసుపత్రి', 'డాక్టర్', 'వైద్యం', 'అనారోగ్యం', 'నొప్పి', 'మందు',
      'జ్వరం', 'ఆరోగ్య సమస్య', 'వైద్య సహాయం',
      // Romanized
      'maruthuvam', 'hospital', 'doctor', 'arogyam', 'vaidyam', 'swasthya', 'dawai'
    ],
    sanitation: [
      // English
      'garbage', 'waste', 'trash', 'dirt', 'clean', 'cleaning', 'dustbin', 'dump', 'litter', 'smell', 'toilet', 'drainage', 'sewer',
      'dirty', 'garbage collection', 'waste management', 'sanitation problem',
      // Hindi
      'सफाई', 'कचरा', 'गंदगी', 'कूड़ा', 'शौचालय', 'नाली', 'गंदा',
      'सफाई नहीं', 'कचरा पड़ा है', 'गंदगी है', 'बदबू',
      // Tamil
      'சுத்தம்', 'கழிவு', 'குப்பை', 'அழுக்கு', 'துப்புரவு', 'கழிப்பறை', 'வடிகால்',
      'குப்பை சேர்ந்துள்ளது', 'சுத்தம் இல்லை', 'துர்நாற்றம்',
      // Telugu
      'శుభ్రత', 'చెత్త', 'చెత్తబుట్ట', 'మురికి', 'శుభ్రపరచు', 'మరుగుదొడ్డి', 'కాలువ',
      'చెత్త పేరుకుపోయింది', 'శుభ్రత లేదు', 'దుర్వాసన',
      // Romanized
      'sutham', 'kuppai', 'chetha', 'kachara', 'gandagi', 'muriki', 'safai', 'ganda'
    ]
  };

  // Check streetlight first for electricity-related keywords to avoid conflicts
  for (const [category, keywords] of Object.entries(categories)) {
    // Normalize keywords as well for consistent Unicode matching
    const hasMatch = keywords.some(keyword => {
      const normalizedKeyword = keyword.normalize('NFC').toLowerCase();
      return lowerText.includes(normalizedKeyword);
    });
    
    if (hasMatch) {
      console.log(`[Category Detection] Text: "${text}" → Category: "${category}"`);
      return category;
    }
  }
  
  console.log(`[Category Detection] Text: "${text}" → Category: "other" (no match found)`);
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
        console.error('Invalid location structure:', parsedLocation);
        throw new Error('Location must have lat and lng properties');
      }
      
      console.log('Parsed location:', parsedLocation);
    } catch (parseError) {
      console.error('Location parse error:', parseError, 'Received:', location);
      return res.status(400).json({ message: 'Invalid location format', details: parseError.message });
    }

    // Auto-detect category
    const category = detectCategory(complaintText);
    console.log('Detected category:', category);

    // Get image URL if uploaded
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // Get address details from coordinates
    console.log('Fetching address for coordinates:', parsedLocation.lat, parsedLocation.lng);
    const addressDetails = await getAddressFromCoordinates(parsedLocation.lat, parsedLocation.lng);
    console.log('Address details:', addressDetails);

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

    console.log('Saving complaint to database...');
    await complaint.save();

    console.log('Complaint saved successfully:', complaint._id);

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to submit complaint', 
      error: error.message,
      details: error.toString()
    });
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

// Delete User's Own Complaint (No Auth Required - uses userId) - MUST BE BEFORE /:id routes
router.delete('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    console.log('Delete user complaint request:', { id, userId });

    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const complaint = await Complaint.findOne({ _id: id, userId });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found or unauthorized' });
    }

    await Complaint.findByIdAndDelete(id);
    console.log('Complaint deleted successfully:', id);

    res.json({
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user complaint:', error);
    res.status(500).json({ message: 'Failed to delete complaint' });
  }
});

// Update User's Own Complaint (No Auth Required - uses userId) - MUST BE BEFORE /:id routes
router.put('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, complaintText, language } = req.body;

    console.log('Update user complaint request:', { id, userId, complaintText });

    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const complaint = await Complaint.findOne({ _id: id, userId });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found or unauthorized' });
    }

    // Update fields
    if (complaintText) {
      complaint.complaintText = complaintText;
      // Re-detect category if text changed
      complaint.category = detectCategory(complaintText);
    }
    if (language) complaint.language = language;

    await complaint.save();
    console.log('Complaint updated successfully:', id);

    res.json({
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Error updating user complaint:', error);
    res.status(500).json({ message: 'Failed to update complaint' });
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

// Delete Complaint (Admin - Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Admin delete complaint request:', id);

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    console.log('Admin deleted complaint successfully:', id);

    res.json({
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ message: 'Failed to delete complaint' });
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
