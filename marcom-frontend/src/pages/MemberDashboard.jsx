import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import API from '../api/axios';
import '../style/MemberDashboard.css';
import RequestDetailModal from '../components/RequestDetail';
import Sidebar from '../components/Sidebar';
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

  const user = JSON.parse(localStorage.getItem('user'));

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
    setNotifications(res.data || []);
  } catch (err) {
    console.error(err);
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
    <div className="member-layout">
      <Sidebar
            user={user}
            active="dashboard"
            onLogout={handleLogout} />

      <main className="member-main">
        <header className="page-header">
            <h1>Dashboard Saya</h1>

            <button
                className="notification-btn"
                onClick={() => {
                    if (notifications.length > 0) {
                        setSelectedRequestId(
                            notifications[0].id
                        );
                    }
                }}
            >
                <Bell size={20} />

                {notifications.length > 0 && (
                    <span className="notification-badge">
                        {notifications.length}
                    </span>
                )}
            </button>
        </header>

        <section className="greeting-box">
          <div className="greeting-content">
            <h2>Selamat datang, {user?.name}!</h2>
            <p>Pantau dan kelola request konten kamu dari sini</p>
          </div>
        </section>

        <section className="summary-grid">
          <div className="summary-card total">
            <h2>{summary.total}</h2>
            <p>Total Request</p>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: summary.total > 0 ? '100%' : '0%' }}
              ></div>
            </div>
          </div>

          <div className="summary-card waiting">
            <h2>{summary.menunggu}</h2>
            <p>Menunggu</p>
            <div className="progress-track">
              <div className="progress-fill"></div>
            </div>
          </div>

          <div className="summary-card process">
            <h2>{summary.diproses}</h2>
            <p>Diproses</p>
            <div className="progress-track">
              <div className="progress-fill"></div>
            </div>
          </div>

          <div className="summary-card revision">
            <h2>{summary.revisi}</h2>
            <p>Revisi</p>
            <div className="progress-track">
              <div className="progress-fill"></div>
            </div>
          </div>

          <div className="summary-card done">
            <h2>{summary.selesai}</h2>
            <p>Selesai</p>
            <div className="progress-track">
              <div className="progress-fill"></div>
            </div>
          </div>

          <div className="summary-card rejected">
            <h2>{summary.ditolak}</h2>
            <p>Ditolak</p>
            <div className="progress-track">
              <div className="progress-fill"></div>
            </div>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="bg-white custom-card-style p-5 h-[380px] flex flex-col justify-between">
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
          style={{ color: "var(--color-diproses)" }}
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

          <section className="request-panel">
            <div className="panel-title">
              <h2>Request Terbaru</h2>
            </div>

            <div className="request-list">
              {loading ? (
                <div className="request-row empty-row">
                  <div>
                    <h3>Memuat data...</h3>
                    <p>Mohon tunggu sebentar.</p>
                  </div>
                </div>
              ) : requests.length === 0 ? (
                <div className="request-row empty-row">
                  <div>
                    <h3>Belum ada request</h3>
                    <p>Request yang kamu input akan muncul di sini.</p>
                  </div>
                </div>
              ) : (
                requests.slice(0, 3).map((item) => (
                  <div
                    className="request-row"
                    key={item.id}
                    onClick={() => setSelectedRequestId(item.id)}
                  >
                    <div>
                      <h3>{item.title}</h3>
                      <p>
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

      <div className="notification-container">
  {notifications.slice(0, 3).map((notif) => (
    <div className="notification-card" key={notif.id}>
      <strong>{notif.title}</strong>

      <p>Status: {notif.status}</p>

      {notif.latest_comment && (
        <small>Komentar: {notif.latest_comment}</small>
      )}
    </div>
  ))}
</div>

      <button className="help-btn">?</button>

      {selectedRequestId && (
        <RequestDetailModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onUpdated={getDashboardData}
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