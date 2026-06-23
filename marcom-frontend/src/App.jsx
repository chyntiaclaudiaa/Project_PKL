import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard'; // 1. Sudah diimport aman
import AtasanDashboardMonitoring from "./pages/AtasanDashboardMonitoring";
import AtasanProtectedRoute from "./components/atasan/AtasanProtectedRoute";
import AtasanRequestPage from "./pages/AtasanRequestPage";
import AtasanRequestDetailPage from "./pages/AtasanRequestDetailPage";
import AtasanReportPage from "./pages/AtasanReportPage";
import AtasanProfilePage from "./pages/AtasanProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Jalur default mengarah ke halaman Login */}
        <Route path="/login" element={<Login />} />
        
        {/* 2. Di sini kita panggil komponen AdminDashboard yang sesungguhnya */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        {/* Dashboard Atasan */}
        <Route path="/atasan/dashboard" element={  <AtasanProtectedRoute>  <AtasanDashboardMonitoring />  </AtasanProtectedRoute>  } />

        {/* Semua Request */}
        <Route  path="/atasan/request"  element={  <AtasanProtectedRoute>  <AtasanRequestPage />  </AtasanProtectedRoute>  } />

        <Route  path="/atasan/request/:id"  element={ <AtasanProtectedRoute>   <AtasanRequestDetailPage />  </AtasanProtectedRoute> } />
        
        <Route path="/atasan/report" element={<AtasanReportPage />} />

        <Route path="/atasan/profile" element={<AtasanProfilePage />} />

        {/* Redirect jika mengetik link sembarang */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;