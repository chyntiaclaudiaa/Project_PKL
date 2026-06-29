import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import API from '../api/axios';
import '../style/MemberDashboard.css';
import RequestDetailModal from '../components/RequestDetail';
import Sidebar from '../components/Sidebar';

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

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    getDashboardData();
  }, []);

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
          <section className="distribusi-panel">
            <div className="panel-title">
              <h2>Distribusi Status</h2>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Menunggu', value: summary.menunggu, fill: '#E3781A' },
                      { name: 'Diproses', value: summary.diproses, fill: '#006DC3' },
                      { name: 'Revisi', value: summary.revisi, fill: '#DDC000' },
                      { name: 'Selesai', value: summary.selesai, fill: '#1D9E75' },
                      { name: 'Ditolak', value: summary.ditolak, fill: '#E7000B' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#E3781A" />
                    <Cell fill="#006DC3" />
                    <Cell fill="#DDC000" />
                    <Cell fill="#1D9E75" />
                    <Cell fill="#E7000B" />
                  </Pie>
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle"
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-center-text">
                <div className="chart-number">{summary.total}</div>
                <div className="chart-label">Total</div>
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