import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard'; // 1. Sudah diimport aman

function App() {
  return (
    <Router>
      <Routes>
        {/* Jalur default mengarah ke halaman Login */}
        <Route path="/login" element={<Login />} />
        
        {/* 2. Di sini kita panggil komponen AdminDashboard yang sesungguhnya */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Redirect jika mengetik link sembarang */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;