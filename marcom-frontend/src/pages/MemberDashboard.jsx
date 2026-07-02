import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import API from '../api/axios';
import '../style/atasan_dashboard.css'; 
import RequestDetailModal from '../components/RequestDetail';
import Sidebar from '../components/Sidebar';
import NotificationPopup from '../components/atasan/NotificationPopup';
import { Bell } from "lucide-react";

function MemberDashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    total: 0,
    menunggu: 0,
    diproses: 0,
    revisi: 0,
    selesai: 0,
    ditolak: 0,
  });

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const unreadCount = notifications.filter(
    (n) => !n.is_read || String(n.is_read) === 'false'
  ).length;

  useEffect(() => {
  getDashboardData();
  getNotifications();

  const interval = setInterval(() => {
    getNotifications();
  }, 10000);

  return () => clearInterval(interval);
}, []);


  const getNotifications = async () => {
  try {
    const res = await API.get('/requests/notifications');
    const mapped = (res.data || []).map((n) => ({
      notification_id: n.id,
      comment_id: n.id,
      request_id: n.request_id,
      commenter_name: n.sender_name,
      comment_text: n.comment,
      is_read: n.is_read,
      created_at: n.created_at,
      title: n.title,
    }));
    setNotifications(mapped);
  } catch (err) {
    console.error(err);
  }
};

  const handleNotificationClick = async (notif) => {
    try {
      const isUnread = notif.is_read === false || String(notif.is_read) === "false" || notif.is_read === 0 || notif.is_read === "0";
      if (isUnread) {
        await API.put(`/requests/notifications/${notif.comment_id}/read`);
        await getNotifications();
      }
      setIsPopupOpen(false);
      setSelectedRequestId(notif.request_id);
    } catch (err) {
      console.error('Gagal menandai notifikasi:', err);
    }
  };

  const getDashboardData = async () => {

    try {
      setLoading(true);

      const summaryRes = await API.get('/requests/my/summary');
      const requestsRes = await API.get('/requests/my');

      setSummary({
        total: Number(summaryRes.data.total || 0),
        menunggu: Number(summaryRes.data.menunggu || 0),
        diproses: Number(summaryRes.data.diproses || 0),
        revisi: Number(summaryRes.data.revisi || 0),
        selesai: Number(summaryRes.data.selesai || 0),
        ditolak: Number(summaryRes.data.ditolak || 0),
      });

      setRequests(requestsRes.data || []);
    } catch (error) {
      console.error(error.response?.data?.message || 'Gagal mengambil data dashboard.');

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusClass = (status) => {
    if (status === 'Menunggu') return 'status waiting';
    if (status === 'Diproses') return 'status process';
    if (status === 'Revisi') return 'status revision';
    if (status === 'Selesai') return 'status done';
    if (status === 'Ditolak') return 'status rejected';
    return 'status';
  };

  const formatDateWithTime = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return dateString;

    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    return date.toLocaleString('id-ID', options);
  };

  return (
    <div className="flex h-screen bg-[#fafbfc] relative">
      <Sidebar
            user={user}
            active="dashboard"
            onLogout={handleLogout} />

      <div className="flex-1 overflow-auto">
        <header className="bg-white px-8 py-5 flex justify-between items-center border-b border-slate-200 sticky top-0 z-10">
            <h1 className="text-lg font-bold text-slate-800">Dashboard Saya</h1>

            <div className="relative">
                <button
                    className="p-1.5 text-orange-500 rounded-full hover:bg-slate-100 transition-colors relative focus:outline-none"
                    onClick={() => setIsPopupOpen((prev) => !prev)}
                >
                    <Bell size={22} className="text-orange-500 stroke-[2]" />

                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 border-2 border-white rounded-full text-[9px] font-bold text-white leading-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {isPopupOpen && (
                    <NotificationPopup
                        notifications={notifications}
                        onClose={() => setIsPopupOpen(false)}
                        onNotificationClick={handleNotificationClick}
                    />
                )}
            </div>
        </header>

        <main className="p-6 space-y-6 max-w-[1400px] mx-auto">
        <section className="welcome-gradient-bg p-6 rounded-2xl text-white relative overflow-hidden shadow-none border border-slate-300">
          <h2 className="text-lg font-bold">Selamat datang, {user?.name}!</h2>
          <p className="text-white/70 text-xs mt-1 font-light">Pantau dan kelola request konten kamu dari sini</p>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 border-l-[5px] rounded-l-2xl" style={{ borderLeftColor: 'var(--color-total)' }}>
            <h2 className="text-3xl font-extrabold text-slate-800" style={{ color: 'var(--color-total)' }}>{summary.total}</h2>
            <p className="text-xs text-slate-500 font-medium mt-1.5">Total Request</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border-l-[5px] rounded-l-2xl" style={{ borderLeftColor: 'var(--color-menunggu)' }}>
            <h2 className="text-3xl font-extrabold" style={{ color: 'var(--color-menunggu)' }}>{summary.menunggu}</h2>
            <p className="text-xs text-slate-500 font-medium mt-1.5">Menunggu</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border-l-[5px] rounded-l-2xl" style={{ borderLeftColor: 'var(--color-diproses)' }}>
            <h2 className="text-3xl font-extrabold" style={{ color: 'var(--color-diproses)' }}>{summary.diproses}</h2>
            <p className="text-xs text-slate-500 font-medium mt-1.5">Diproses</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border-l-[5px] rounded-l-2xl" style={{ borderLeftColor: 'var(--color-revisi)' }}>
            <h2 className="text-3xl font-extrabold" style={{ color: 'var(--color-revisi)' }}>{summary.revisi}</h2>
            <p className="text-xs text-slate-500 font-medium mt-1.5">Revisi</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border-l-[5px] rounded-l-2xl" style={{ borderLeftColor: 'var(--color-selesai)' }}>
            <h2 className="text-3xl font-extrabold" style={{ color: 'var(--color-selesai)' }}>{summary.selesai}</h2>
            <p className="text-xs text-slate-500 font-medium mt-1.5">Selesai</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border-l-[5px] rounded-l-2xl" style={{ borderLeftColor: 'var(--color-ditolak)' }}>
            <h2 className="text-3xl font-extrabold" style={{ color: 'var(--color-ditolak)' }}>{summary.ditolak}</h2>
            <p className="text-xs text-slate-500 font-medium mt-1.5">Ditolak</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-5 bg-white custom-card-style p-5 h-[380px] flex flex-col justify-between">
  <div>
    <h3 className="text-sm font-bold text-slate-800">
      Distribusi Status
    </h3>
  </div>

  <div className="flex items-center justify-between gap-2 h-full mt-2">
    <div className="w-1/2 h-[220px] relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[
              {
                status: "Menunggu",
                total: summary.menunggu,
              },
              {
                status: "Diproses",
                total: summary.diproses,
              },
              {
                status: "Revisi",
                total: summary.revisi,
              },
              {
                status: "Selesai",
                total: summary.selesai,
              },
              {
                status: "Ditolak",
                total: summary.ditolak,
              },
            ]}
            dataKey="total"
            nameKey="status"
            innerRadius={65}
            outerRadius={85}
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill="var(--color-menunggu)" />
            <Cell fill="var(--color-diproses)" />
            <Cell fill="var(--color-revisi)" />
            <Cell fill="var(--color-selesai)" />
            <Cell fill="var(--color-ditolak)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className="text-2xl font-black"
          style={{ color: "var(--color-total)" }}
        >
          {summary.total}
        </span>

        <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
          Total
        </span>
      </div>
    </div>

    <div className="w-1/2 space-y-2 px-2">
      <div className="flex items-center gap-2 text-[11px]">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: "var(--color-menunggu)" }}
        />
        Menunggu: {summary.menunggu}
      </div>

      <div className="flex items-center gap-2 text-[11px]">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: "var(--color-diproses)" }}
        />
        Diproses: {summary.diproses}
      </div>

      <div className="flex items-center gap-2 text-[11px]">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: "var(--color-revisi)" }}
        />
        Revisi: {summary.revisi}
      </div>

      <div className="flex items-center gap-2 text-[11px]">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: "var(--color-selesai)" }}
        />
        Selesai: {summary.selesai}
      </div>

      <div className="flex items-center gap-2 text-[11px]">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: "var(--color-ditolak)" }}
        />
        Ditolak: {summary.ditolak}
      </div>
    </div>
  </div>
</section>

          <section className="lg:col-span-7 bg-white custom-card-style p-5 h-[380px] flex flex-col">
            <div className="mb-3">
              <h2 className="text-sm font-bold text-slate-800">Request Terbaru</h2>
            </div>

            <div className="flex-1 overflow-auto space-y-2">
              {loading ? (
                <div className="p-4 text-center">
                  <h3 className="text-sm font-semibold text-slate-700">Memuat data...</h3>
                  <p className="text-xs text-slate-400 mt-1">Mohon tunggu sebentar.</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="p-4 text-center">
                  <h3 className="text-sm font-semibold text-slate-700">Belum ada request</h3>
                  <p className="text-xs text-slate-400 mt-1">Request yang kamu input akan muncul di sini.</p>
                </div>
              ) : (
                requests.slice(0, 3).map((item) => (
                  <div
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                    key={item.id}
                    onClick={() => setSelectedRequestId(item.id)}
                  >
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-800 truncate">{item.title}</h3>
                      <p className="text-xs text-slate-400 truncate">
                        {item.letter_number} · Tenggat: {formatDateWithTime(item.deadline)}
                      </p>
                    </div>

                    <span className={getStatusClass(item.status)}>
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
        </main>
      </div>

      <button className="help-btn">?</button>

      {selectedRequestId && (
        <RequestDetailModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onUpdated={getDashboardData}
          currentUserId={user?.id}
          currentUserName={user?.name}
        />
      )}
    </div>
  );
}

const formatDate = (dateString) => {
  if (!dateString) return '-';

  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }

  return dateString;
};

const getProgressWidth = (value, total) => {
  const numberValue = Number(value || 0);
  const numberTotal = Number(total || 0);

  if (numberTotal === 0) return '0%';

  return `${Math.round((numberValue / numberTotal) * 100)}%`;
};

export default MemberDashboard;