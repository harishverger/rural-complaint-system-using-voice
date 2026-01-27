# Voice-First Rural Problem Reporting System

A comprehensive full-stack application for rural citizens to report problems using voice in their native language. The system consists of three separate applications: citizen portal, admin portal, and backend API.

## 🎯 Features

### Citizen Portal (Port 3000)
- **Voice Recording**: Record complaints using Web Speech API in multiple languages (Tamil, Telugu, Hindi, English)
- **Multilingual UI**: Complete internationalization - all UI elements translate with language selection
- **Auto Category Detection**: Automatic classification of complaints into categories (water, road, health, streetlight, sanitation)
- **Location Capture**: Automatic GPS location capture with reverse geocoding (converts to address)
- **Photo Upload**: Optional image upload to document issues
- **Complaint Tracking**: View status of submitted complaints (Open/In Progress/Resolved)
- **Mobile Responsive**: Large buttons and rural-friendly UI design

### Admin Portal (Port 3001) - Completely Separate Application
- **JWT Authentication**: Secure admin login
- **Dashboard Analytics**: Real-time statistics and category breakdown
- **Complaint Management**: View, filter, and update complaint status
- **Volunteer Assignment**: Assign complaints to specific volunteers
- **Map View**: View complaint locations on interactive map with full address details
- **Status Updates**: Change complaint status (Open → In Progress → Resolved)
- **Filters**: Filter by category and status

## 🛠️ Tech Stack

### Frontend (Client & Admin)
- **Vite** - Fast build tool and dev server
- **React** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Leaflet** - Maps integration
- **Web Speech API** - Voice recognition

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File upload
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
Hackathon/
├── client/                 # Citizen Frontend (Port 3000)
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js     # Citizen API client
│   │   ├── pages/
│   │   │   └── citizen/   # Citizen pages
│   │   │       ├── Home.jsx
│   │   │       ├── Preview.jsx
│   │   │       └── MyComplaints.jsx
│   │   ├── i18n.js        # Translations
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── admin/                  # Admin Frontend (Port 3001)
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js     # Admin API client
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/                # Backend API (Port 5000)
    ├── models/
    │   ├── Complaint.js   # Complaint schema
    │   └── Admin.js       # Admin schema
    ├── routes/
    │   ├── complaints.js  # Complaint routes
    │   └── admin.js       # Admin routes
    ├── middleware/
    │   ├── auth.js        # JWT authentication
    │   └── upload.js      # File upload config
    ├── uploads/           # Uploaded images directory
    ├── index.js           # Server entry point
    ├── seedAdmin.js       # Script to create admin user
    ├── package.json
    ├── .env
    └── .gitignore
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier works)
- Modern web browser with microphone access

### Installation

#### 1. Setup Backend (Port 5000)

```bash
cd server

# Install dependencies
npm install

# Create .env file with your MongoDB Atlas connection string
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/rural-complaints
# PORT=5000
# JWT_SECRET=your_secret_key

# Create admin user (credentials: admin@rural.com / admin123)
node seedAdmin.js

# Start server
npm start
```

Server will run on http://localhost:5000

#### 2. Setup Citizen Application (Port 3000)

```bash
cd client

# Install dependencies
npm install

# Start dev server
npm run dev
```

Client will run on http://localhost:3000

#### 3. Setup Admin Portal (Port 3001)

Open a new terminal:

```bash
cd client

# Install dependencies
npm install

```bash
cd admin

# Install dependencies
npm install

# Start dev server
npm run dev
```

Admin will run on http://localhost:3001

## 🔑 Default Admin Credentials

```
Email: admin@rural.com
Password: admin123
```

**⚠️ Important**: Change these credentials in production!

## 🌐 Application URLs

- **Citizen Portal**: http://localhost:3000
- **Admin Portal**: http://localhost:3001
- **Backend API**: http://localhost:5000

**Note**: All three applications must be running simultaneously.

## 📡 API Endpoints

### Admin Routes
- `POST /api/admin/login` - Admin login

### Complaint Routes
- `POST /api/complaints` - Create new complaint (with image upload)
- `GET /api/complaints` - Get all complaints (Admin only, requires JWT)
- `GET /api/complaints/user/:userId` - Get user's complaints
- `PUT /api/complaints/:id` - Update complaint (Admin only, requires JWT)
- `GET /api/complaints/analytics/stats` - Get analytics (Admin only, requires JWT)

## 🌍 Supported Languages

- **English** (en-IN)
- **Tamil** (ta-IN) - தமிழ்
- **Telugu** (te-IN) - తెలుగు
- **Hindi** (hi-IN) - हिंदी

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop browsers
- Tablets
- Mobile devices

Large touch-friendly buttons make it accessible for rural users.

## 🎨 Category Auto-Detection

The system automatically detects complaint categories based on 100+ keywords including slang:

- **💧 Water Supply**: water, pipe, leak, தண்ணீர், నీరు, पानी
- **🛣️ Road Issue**: road, pothole, சாலை, రోడ్డు, सड़क
- **🏥 Health**: health, hospital, doctor, மருத்துவம், ఆరోగ్యం, स्वास्थ्य
- **💡 Street Light**: light, street light, lamp, விளக்கு, లైట్, बत्ती
- **🗑️ Sanitation**: garbage, waste, clean, சுத்தம், శుభ్రత, सफाई

## 🔧 Configuration

### Environment Variables

**Server (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rural-complaints
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

**Client (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or use MongoDB Atlas
- Check MONGODB_URI in server/.env

### Voice Recognition Not Working
- Ensure you're using HTTPS (or localhost)
- Grant microphone permissions
- Use Chrome/Edge browser (best support)

### Image Upload Not Working
- Check server/uploads directory exists
- Ensure Multer is installed

### Admin Login Fails
- Run `node seedAdmin.js` to create admin user
- Check JWT_SECRET is set in .env
- Clear browser localStorage

## 📝 Development Scripts

### Server
```bash
npm run dev    # Start with nodemon (auto-reload)
npm start      # Start production server
```

### Client
```bash
npm run dev    # Start dev server
npm run build  # Build for production
npm run preview # Preview production build
```

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)
1. Set environment variables
2. Ensure MongoDB Atlas connection string
3. Deploy server folder

### Frontend Deployment (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy dist folder
3. Set VITE_API_URL to production API

## 🤝 Contributing

This is a hackathon project. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

ISC License - Free to use and modify

## 👨‍💻 Author

Built for rural community empowerment hackathon

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Web Speech API for voice recognition
- Leaflet for maps
- Tailwind CSS for styling

---

**Made with ❤️ for Rural Communities**
