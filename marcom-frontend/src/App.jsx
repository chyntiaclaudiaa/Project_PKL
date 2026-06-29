import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import InputRequest from './pages/InputRequest';
import MyRequests from './pages/MyRequests';
import Profile from './pages/Profile';
import UploadResult from './pages/UploadResult';
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
        <Route path="/login" element={<Login />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        {/* Dashboard Atasan */}
        <Route path="/atasan/dashboard" element={  <AtasanProtectedRoute>  <AtasanDashboardMonitoring />  </AtasanProtectedRoute>  } />

        {/* Semua Request */}
        <Route  path="/atasan/request"  element={  <AtasanProtectedRoute>  <AtasanRequestPage />  </AtasanProtectedRoute>  } />

        <Route  path="/atasan/request/:id"  element={ <AtasanProtectedRoute>   <AtasanRequestDetailPage />  </AtasanProtectedRoute> } />
        
        <Route path="/atasan/report" element={<AtasanReportPage />} />

        <Route path="/atasan/profile" element={<AtasanProfilePage />} />

        <Route path="/anggota/dashboard" element={<MemberDashboard />} />

        <Route path="/anggota/input-request" element={<InputRequest />} />

        <Route path="/anggota/input-request" element={<InputRequest />} />

        <Route path="/anggota/input-request/:id" element={<InputRequest />} />\

        <Route path="/anggota/requests" element={<MyRequests />} />

        <Route path="/anggota/profile" element={<Profile />} />

        <Route path="/anggota/upload-hasil" element={<UploadResult />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;