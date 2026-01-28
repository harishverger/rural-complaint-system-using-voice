import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStrings, languageCodes } from '../../i18n';

const Home = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [language, setLanguage] = useState(localStorage.getItem('uiLanguage') || 'English');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const strings = getStrings(language);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setComplaintText(transcript);
        setIsRecording(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        alert(strings.voiceErrorAlert);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(coords);
          
          // Fetch address details
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'RuralComplaintSystem/1.0'
                }
              }
            );
            const data = await response.json();
            const addressData = data.address || {};
            setAddress({
              placeName: addressData.village || addressData.town || addressData.suburb || addressData.neighbourhood || 'Unknown',
              state: addressData.state || '',
              pincode: addressData.postcode || ''
            });
          } catch (error) {
            console.error('Error fetching address:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert(strings.locationRequiredAlert);
        }
      );
    }
  }, []);

  // Set language for speech recognition
  useEffect(() => {
    if (recognition) {
      recognition.lang = languageCodes[language];
    }
  }, [language, recognition]);

  useEffect(() => {
    localStorage.setItem('uiLanguage', language);
  }, [language]);

  const startRecording = () => {
    if (recognition) {
      setIsRecording(true);
      recognition.start();
    } else {
      alert(strings.speechNotSupported);
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreview = () => {
    if (!complaintText.trim()) {
      alert(strings.provideComplaintAlert);
      return;
    }

    if (!location) {
      alert(strings.locationRequiredAlert);
      return;
    }

    // Store data in sessionStorage for preview page
    sessionStorage.setItem('complaintData', JSON.stringify({
      complaintText,
      language,
      location,
      imagePreview
    }));
    
    // Store image file separately
    if (image) {
      sessionStorage.setItem('hasImage', 'true');
    }

    navigate('/preview', { state: { complaintText, language, location, image, imagePreview } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 animate-gradient">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-3">
            <svg
              className="w-16 h-16 drop-shadow-lg"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="villageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              {/* Left house */}
              <path
                d="M3 16v-5l3-3 3 3v5z"
                fill="url(#villageGradient)"
                opacity="0.8"
              />
              <rect x="4" y="12" width="1" height="1" fill="#fff" opacity="0.6" />
              <rect x="6" y="12" width="1" height="1" fill="#fff" opacity="0.6" />
              {/* Center house (taller) */}
              <path
                d="M8 18v-7l3-3 3 3v7z"
                fill="url(#villageGradient)"
              />
              <rect x="9" y="12" width="1" height="1.5" fill="#fff" opacity="0.7" />
              <rect x="11" y="12" width="1" height="1.5" fill="#fff" opacity="0.7" />
              {/* Right house */}
              <path
                d="M14 16v-5l3-3 3 3v5z"
                fill="url(#villageGradient)"
                opacity="0.8"
              />
              <rect x="15" y="12" width="1" height="1" fill="#fff" opacity="0.6" />
              <rect x="17" y="12" width="1" height="1" fill="#fff" opacity="0.6" />
              {/* Ground line */}
              <line x1="2" y1="21" x2="22" y2="21" stroke="#7c3aed" strokeWidth="0.5" opacity="0.4" />
            </svg>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-purple-700 leading-tight whitespace-nowrap">
              {strings.appTitle}
            </h1>
          </div>
          <p className="text-gray-700 text-lg font-medium">{strings.appSubtitle}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-3 sm:mb-4 border border-purple-100 hover:shadow-purple-200 transition-all duration-300">
          {/* Language Selector */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-800 font-bold mb-2 sm:mb-3 text-base sm:text-lg flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🌐</span>
              {strings.selectLanguageLabel}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-purple-200 rounded-xl sm:rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none text-base sm:text-lg font-medium bg-gradient-to-r from-purple-50 to-pink-50 hover:border-purple-400 transition-all cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
              <option value="Hindi">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* Voice Recording Button */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative w-full py-6 sm:py-8 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-white font-bold text-lg sm:text-xl transition-all transform active:scale-95 sm:hover:scale-105 shadow-lg overflow-hidden ${
                isRecording
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-300 animate-pulse-slow'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-purple-300'
              }`}
            >
              {isRecording && (
                <span className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-rose-400/20 animate-shimmer"></span>
              )}
              <span className="relative z-10">
                {isRecording ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
                    <span>{strings.recordStop}</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <span>{strings.recordStart}</span>
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* Complaint Text Area */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-800 font-bold mb-2 sm:mb-3 text-base sm:text-lg flex items-center gap-2">
              <span className="text-xl sm:text-2xl">📝</span>
              {strings.typeLabel}
            </label>
            <textarea
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder={strings.complaintPlaceholder}
              rows="5"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-purple-200 rounded-xl sm:rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none text-base sm:text-lg resize-none bg-gradient-to-br from-purple-50/50 to-pink-50/50 hover:border-purple-300 transition-all"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
              {strings.uploadLabel}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="imageUpload"
            />
            <label
              htmlFor="imageUpload"
              className="block w-full py-3 sm:py-4 px-4 sm:px-6 text-center text-base sm:text-lg font-semibold bg-green-100 text-green-700 rounded-lg sm:rounded-xl border-2 border-green-300 active:bg-green-200 sm:hover:bg-green-200 cursor-pointer transition-all"
            >
              {image ? strings.uploadSelected : strings.uploadAdd}
            </label>
            {imagePreview && (
              <div className="mt-4 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="relative w-full h-64 object-cover rounded-2xl shadow-lg border-4 border-white transform group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            )}
          </div>

          {/* Location Status */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-5 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl border-2 border-green-200 shadow-md">
            <div className="flex items-start">
              <span className="mr-2 sm:mr-4 animate-pulse-slow flex-shrink-0">
                <svg
                  className="w-7 h-7 sm:w-10 sm:h-10 drop-shadow-md"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ff5b5b" />
                      <stop offset="100%" stopColor="#d60000" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#pinGradient)"
                    d="M12 2c-3.87 0-7 3.13-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 10.25a3.25 3.25 0 1 1 0-6.5 3.25 3.25 0 0 1 0 6.5z"
                  />
                  <circle cx="12" cy="9" r="1.8" fill="#fff" opacity="0.9" />
                </svg>
              </span>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-lg mb-1">{strings.locationTitle}</p>
                {location ? (
                  <div className="text-sm text-gray-700">
                    {address ? (
                      <div className="space-y-1">
                        <p className="font-semibold text-green-700 text-base flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          {address.placeName}
                        </p>
                        <p className="text-gray-600 ml-4">{address.state}{address.pincode ? ` - ${address.pincode}` : ''}</p>
                      </div>
                    ) : (
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                        {strings.locationDetected}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    {strings.locationDetecting}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Preview Button */}
          <button
            onClick={handlePreview}
            disabled={!complaintText.trim() || !location}
            className="w-full py-4 sm:py-5 px-6 sm:px-8 text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg active:scale-95 sm:hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform"
          >
            {strings.previewButton}
          </button>
        </div>

        {/* My Complaints Button */}
        <button
          onClick={() => navigate('/my-complaints')}
          className="w-full py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg font-semibold bg-white text-gray-700 rounded-xl shadow-md active:shadow-lg sm:hover:shadow-lg transition-all"
        >
          {strings.myComplaintsButton}
        </button>
      </div>
    </div>
  );
};

export default Home;
