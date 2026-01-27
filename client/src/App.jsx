import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/citizen/Home';
import Preview from './pages/citizen/Preview';
import MyComplaints from './pages/citizen/MyComplaints';

function App() {
  return (
    <Router>
      <Routes>
        {/* Citizen Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
      </Routes>
    </Router>
  );
}

export default App;
