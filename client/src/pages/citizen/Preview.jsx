import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { complaintAPI } from '../../api/api';
import { getStrings } from '../../i18n';

const Preview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [complaintData, setComplaintData] = useState(null);
  const [uiLanguage, setUiLanguage] = useState('English');
  const [showSuccess, setShowSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState(null);
  const strings = getStrings(uiLanguage);

  useEffect(() => {
    // Get data from navigation state or sessionStorage
    const data = location.state || JSON.parse(sessionStorage.getItem('complaintData') || '{}');
    
    if (!data.complaintText) {
      navigate('/');
      return;
    }

    setComplaintData(data);
    const lang = data.language || localStorage.getItem('uiLanguage') || 'English';
    setUiLanguage(lang);
  }, [location, navigate]);

  const detectCategory = (text) => {
    // Normalize Unicode characters for proper Tamil/Telugu matching
    const normalizedText = text.normalize('NFC');
    const lowerText = normalizedText.toLowerCase();
    
    const categories = {
      streetlight: [
        'light', 'street light', 'lamp', 'bulb', 'electricity', 'pole', 'dark', 'lighting', 'power', 'current', 'not working',
        'electric', 'electrical', 'no light', 'no electricity', 'no current', 'no power', 'power cut', 'load shedding',
        'विद्युत', 'करंट', 'लाइट', 'बिजली', 'बत्ती', 'स्ट्रीट लाइट', 'अंधेरा', 'खम्भा', 'इलेक्ट्रिसिटी', 'पावर',
        'करेंट नहीं', 'बिजली नहीं', 'लाइट नहीं', 'बिजली का', 'बिजली की',
        'விளக்கு', 'தெரு விளக்கு', 'மின்சாரம்', 'இருட்டு', 'மின்',
        'లైట్', 'విద్యుత్', 'బల్బు', 'స్ట్రీట్ లైట్', 'చీకటి', 'కరెంట్',
        'vilakku', 'light', 'current', 'minsaram', 'vidyut', 'bijli', 'andhere', 'kurrent', 'current nahi', 'bijli nahi'
      ],
      water: [
        'water', 'pipe', 'leak', 'leaking', 'leakage', 'drainage', 'drain', 'tap', 'supply', 'bore', 'well', 'pump', 'motor', 'valve',
        'தண்ணீர்', 'தண்ணி', 'னீரு', 'குழாய்', 'கசிவு', 'வடிகால்',
        'నీరు', 'పైపు', 'కుళాయి', 'లీకేజ్', 'డ్రైనేజ్',
        'पानी', 'पाइप', 'नल', 'लीकेज', 'रिसाव', 'जल', 'जलापूर्ति', 'पानी का', 'पानी की',
        'thani', 'thaani', 'taani', 'kuzhay', 'kuzhai', 'neeru', 'paani'
      ],
      road: [
        'road', 'pothole', 'street', 'highway', 'damage', 'broken', 'crack', 'repair', 'construction', 'pathway', 'sidewalk',
        'சாலை', 'குழி', 'பாதை', 'தெரு', 'ரோடு', 'வீதி', 'உடைந்த', 'சேதம்', 'சாலை சேதம்', 'குழிகள்', 'சாலை உடைந்துள்ளது', 'சாலை பழுது', 'ரோடு சேதம்', 'தெரு சேதம்', 'வீதி சேதம்',
        'రోడ్డు', 'రోడ్', 'గుంట', 'దారి', 'పాతబడిన', 'రోడ్డు పాడు', 'గుంతలు', 'రోడ్డు చెడిపోయింది', 'రోడ్డు సమస్య',
        'सड़क', 'रोड', 'गड्ढा', 'गड्ढे', 'रास्ता', 'मार्ग', 'टूटा', 'सड़क खराब', 'रोड खराब', 'सड़क टूटी', 'रास्ता खराब', 'गड्ढे हैं',
        'salai', 'saalai', 'theru', 'theruvil', 'rodu', 'veethi', 'veedhi', 'paadhai', 'roddu', 'sadak', 'gunta', 'kuzhi', 'patha', 'sadak kharab', 'rodu sedam'
      ],
      health: [
        'health', 'hospital', 'doctor', 'clinic', 'medicine', 'medical', 'sick', 'disease', 'fever', 'pain', 'emergency', 'ambulance',
        'மருத்துவம்', 'மருத்துவமனை', 'டாக்டர்', 'வைத்தியம்', 'நோய்', 'வலி',
        'ఆరోగ్యం', 'ఆసుపత్రి', 'డాక్టర్', 'వైద్యం', 'అనారోగ్యం',
        'स्वास्थ्य', 'अस्पताल', 'डॉक्टर', 'दवा', 'बीमारी', 'दर्द', 'चिकित्सा',
        'maruthuvam', 'hospital', 'doctor', 'arogyam', 'vaidyam', 'swasthya'
      ],
      sanitation: [
        'garbage', 'waste', 'trash', 'dirt', 'clean', 'cleaning', 'dustbin', 'dump', 'litter', 'smell', 'toilet', 'drainage', 'sewer',
        'சுத்தம்', 'கழிவு', 'குப்பை', 'அழுக்கு', 'துப்புரவு', 'கழிப்பறை',
        'శుభ్రత', 'చెత్త', 'చెత్తబుట్ట', 'మురికి', 'శుభ్రపరచు',
        'सफाई', 'कचरा', 'गंदगी', 'कूड़ा', 'सफाई', 'शौचालय', 'नाली',
        'sutham', 'kuppai', 'chetha', 'kachara', 'gandagi', 'muriki', 'safai'
      ]
    };

    // Check streetlight first for electricity-related keywords
    for (const [category, keywords] of Object.entries(categories)) {
      // Normalize keywords as well for consistent Unicode matching
      const hasMatch = keywords.some(keyword => {
        const normalizedKeyword = keyword.normalize('NFC').toLowerCase();
        return lowerText.includes(normalizedKeyword);
      });
      
      if (hasMatch) {
        return category;
      }
    }
    
    return 'other';
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

  const handleSubmit = async () => {
    if (!complaintData) return;

    setLoading(true);

    try {
      // Generate or get user ID (in a real app, this would be from authentication)
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userId', userId);
      }

      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('complaintText', complaintData.complaintText);
      formData.append('language', complaintData.language);
      formData.append('location', JSON.stringify(complaintData.location));

      // Add image if available
      if (location.state?.image) {
        formData.append('image', location.state.image);
      }

      console.log('Sending complaint:', {
        userId,
        complaintText: complaintData.complaintText,
        language: complaintData.language,
        location: complaintData.location,
        hasImage: !!location.state?.image,
        apiUrl: import.meta.env.VITE_API_URL
      });

      const response = await complaintAPI.createComplaint(formData);

      if (response.data) {
        setComplaintId(response.data.complaint._id);
        setShowSuccess(true);
        sessionStorage.removeItem('complaintData');
        sessionStorage.removeItem('hasImage');
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/my-complaints');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      
      // Provide more detailed error messages
      let errorMessage = strings.submitFail;
      if (error.message === 'Network Error') {
        errorMessage = 'Network error - please check your connection and try again. Make sure the server is running.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Missing required fields - please fill in all information';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error - please try again later';
      } else if (error.message?.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = 'Cannot connect to server. Please make sure the server is running on port 5000.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!complaintData) {
    return null;
  }

  const category = detectCategory(complaintData.complaintText);

  // Success Modal
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl transform animate-fade-in">
          {/* Green Checkmark */}
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              <svg
                className="w-full h-full"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                {/* Circle background */}
                <circle cx="12" cy="12" r="11" fill="url(#checkGradient)" />
                {/* Checkmark */}
                <path
                  d="M7 12.5L10.5 16L17 9"
                  stroke="#fff"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-3">
            Success!
          </h2>
          <p className="text-xl text-gray-700 mb-2 font-semibold">
            {strings.submitSuccess}
          </p>
          <p className="text-gray-600 mb-8">
            Your complaint has been recorded and will be reviewed by our team shortly.
          </p>

          {/* Complaint ID */}
          <div className="bg-green-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-600 mb-1">Complaint ID</p>
            <p className="font-mono font-bold text-green-700 break-all">
              {complaintId}
            </p>
          </div>

          {/* Auto redirect message */}
          <p className="text-sm text-gray-500">
            Redirecting to My Complaints in a moment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {strings.headerPreviewTitle}
          </h1>
          <p className="text-gray-600">{strings.headerPreviewSubtitle}</p>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-4">
          {/* Category Badge */}
          <div className="mb-6">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold text-lg">
              <span className="text-2xl mr-2">{getCategoryIcon(category)}</span>
              {getCategoryLabel(category)}
            </div>
          </div>

          {/* Complaint Text */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              {strings.complaintDescription}
            </h3>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-800 text-lg leading-relaxed">
                {complaintData.complaintText}
              </p>
            </div>
          </div>

          {/* Language */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {strings.languageLabel}
            </h3>
            <p className="text-gray-600">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
                {complaintData.language}
              </span>
            </p>
          </div>

          {/* Location */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {strings.locationLabel}
            </h3>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600">
                Latitude: {complaintData.location.lat.toFixed(6)}
              </p>
              <p className="text-gray-600">
                Longitude: {complaintData.location.lng.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Image Preview */}
          {complaintData.imagePreview && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                {strings.attachedPhoto}
              </h3>
              <img
                src={complaintData.imagePreview}
                alt="Complaint"
                className="w-full h-64 object-cover rounded-xl border-2 border-gray-200"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-4 px-6 text-lg font-semibold bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
              disabled={loading}
            >
              {strings.editComplaint}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-4 px-6 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {strings.submitting}
                </span>
              ) : (
                strings.confirmSubmit
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
