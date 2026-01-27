const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rural-complaints')
  .then(async () => {
    console.log('MongoDB connected');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@rural.com' });
    
    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit(0);
    }
    
    // Create admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new Admin({
      email: 'admin@rural.com',
      password: hashedPassword
    });
    
    await admin.save();
    console.log('Admin created successfully!');
    console.log('Email: admin@rural.com');
    console.log('Password: admin123');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
