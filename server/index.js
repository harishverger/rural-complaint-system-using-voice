const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const adminRoutes = require('./routes/admin');
const complaintRoutes = require('./routes/complaints');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://ruralvoice.netlify.app',
    'https://admin-ruralvoice.netlify.app',
    'https://rural-complaint-system-using-voice.vercel.app',
    'https://rural-complaint-client.vercel.app',
    'https://rural-complaint-admin.vercel.app',
    /\.vercel\.app$/  // Allow all Vercel subdomains
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const sanitizedMongoUri = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) return 'undefined';
  return uri.replace(/\/\/.*@/, '//***:***@'); // mask credentials
};

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set - falling back to localhost. Set it in Render env vars.');
} else {
  console.log('Using MONGODB_URI:', sanitizedMongoUri());
}

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rural-complaints', {
      serverSelectionTimeoutMS: 10000 // allow a bit more time for Atlas/serverless wake-up
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Exit so platform restarts; avoids serving traffic without DB
    process.exit(1);
  }
};

// Monitor connection status
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/complaints', complaintRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDb();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Upload directory: ${path.join(__dirname, 'uploads')}`);
  });
};

startServer();
