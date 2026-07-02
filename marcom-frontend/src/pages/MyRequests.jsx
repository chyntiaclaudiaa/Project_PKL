import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import RequestDetailModal from '../components/RequestDetail';
import EditRequestModal from '../components/EditRequestModal';
import '../style/MemberDashboard.css';
import '../style/MyRequests.css';

const STATUS_OPTIONS = ['Semua', 'Menunggu', 'Diproses', 'Revisi', 'Selesai', 'Ditolak'];

// Maps a status label to the color-variable suffix defined in MyRequests.css
// (--color-menunggu, --color-diproses, --color-revisi, --color-selesai, --color-ditolak, --color-total)
const FILTER_COLOR_KEY = {
  Semua: 'total',
  Menunggu: 'menunggu',
  Diproses: 'diproses',
  Revisi: 'revisi',
  Selesai: 'selesai',
  Ditolak: 'ditolak',
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return dateString.includes('T') ? dateString.split('T')[0] : dateString;
};

const getStatusClass = (status) => {
  const map = {
    Menunggu: 'waiting',
    Diproses: 'process',
    Selesai: 'done',
    Revisi: 'revision',
    Ditolak: 'rejected',
  };
  return `request-status ${map[status] || ''}`.trim();
};

function MyRequests() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [editRequestId, setEditRequestId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    getMyRequests();
  }, []);

  const getMyRequests = async () => {
    try {
      setLoading(true);
      const response = await API.get('/requests/my');
      setRequests(response.data || []);
    } catch (error) {
      console.error(error.response?.data?.message || 'Gagal mengambil request.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((item) => {
    const matchStatus = activeFilter === 'Semua' || item.status === activeFilter;
    const keyword = search.toLowerCase();
    const matchSearch =
      !keyword ||
      item.title?.toLowerCase().includes(keyword) ||
      item.letter_number?.toLowerCase().includes(keyword) ||
      item.request_code?.toLowerCase().includes(keyword) ||
      item.platform_target?.toLowerCase().includes(keyword) ||
      item.pic_name?.toLowerCase().includes(keyword);
    return matchStatus && matchSearch;
  });

  return (
    <div className="member-layout">
      <Sidebar user={user} active="myrequest" onLogout={handleLogout} />

      <main className="member-main">

        <div className="request-page-header">
          <div>
            <h1>Request Saya</h1>
          </div>
          <button
            className="new-request-btn"
            onClick={() => navigate('/anggota/input-request')}
          >
            + Request Baru
          </button>
        </div>

        <div className="my-requests-body">

          <div className="request-toolbar">
            <div className="search-input-wrapper">
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Cari judul, nomor surat, kode, platform, PIC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-tabs">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  className={`filter-tab filter-tab--${FILTER_COLOR_KEY[status]} ${
                    activeFilter === status ? 'active' : ''
                  }`}
                  onClick={() => setActiveFilter(status)}
                >
                  {status}
                  {status !== 'Semua' && (
                    <span className="filter-count">
                      {requests.filter((r) => r.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <section className="my-request-content">
            {loading ? (
              <div className="request-empty-card">
                <h3>Memuat data...</h3>
                <p>Mohon tunggu sebentar.</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="request-empty-card">
                <h3>
                  {search || activeFilter !== 'Semua'
                    ? 'Tidak ada request yang cocok'
                    : 'Belum ada request'}
                </h3>
                <p>
                  {search || activeFilter !== 'Semua'
                    ? 'Coba ubah kata kunci atau filter status.'
                    : 'Request yang kamu buat akan muncul di sini.'}
                </p>
              </div>
            ) : (
              filteredRequests.map((item) => (
                <div
                  className="my-request-card"
                  key={item.id}
                  onClick={() => setSelectedRequestId(item.id)}
                >
                  <div className="my-request-info">
                    <div className="request-code-row">
                      <span>{item.request_code || `REQ-${String(item.id).padStart(3, '0')}`}</span>
                      <b className={getStatusClass(item.status)}>{item.status}</b>
                    </div>
                    <h2>{item.title}</h2>
                    <div className="request-meta">
                      <span>{item.letter_number || '-'}</span>
                      <span>Deadline: {formatDate(item.deadline)}</span>
                      <span>{item.platform_target || '-'}</span>
                      <span>PIC: {item.pic_name || '-'}</span>
                    </div>
                  </div>

                  <div className="request-action">
                    {item.status === 'Menunggu' && (
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditRequestId(item.id);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      className="detail-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequestId(item.id);
                      }}
                    >
                      Detail
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      {selectedRequestId && (
        <RequestDetailModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onUpdated={getMyRequests}
          onEdit={() => {
            setSelectedRequestId(null);
            setEditRequestId(selectedRequestId);
          }}
        />
      )}

      {editRequestId && (
        <EditRequestModal
          requestId={editRequestId}
          onClose={() => setEditRequestId(null)}
          onUpdated={() => {
            // Jangan tutup modal di sini — EditRequestModal punya jeda ~800ms
            // untuk menampilkan toast sukses sebelum memanggil onClose sendiri.
            // Menutup modal langsung di sini memotong toast tsb.
            getMyRequests();
          }}
        />
      )}
    </div>
  );
}

export default MyRequests;