import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import '../style/MemberDashboard.css';
import '../style/UploadResult.css';

// Pindahkan fungsi ke atas sebelum component
const getStatusClass = (status) => {
  if (status === 'Diproses') return 'upload-status process';
  if (status === 'Revisi') return 'upload-status revision';
  if (status === 'Selesai') return 'upload-status completed';
  return 'upload-status';
};

function UploadResult() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [expandedHistory, setExpandedHistory] = useState({});

  const user = JSON.parse(localStorage.getItem('user'));

  const MAX_FILE_SIZE = 200 * 1024 * 1024;
  const MAX_FILES = 10;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    getRequestsNeedUpload();
  }, []);

  const getRequestsNeedUpload = async () => {
    try {
      setLoading(true);
      const response = await API.get('/requests/my');
      const filtered = (response.data || []).filter((item) =>
        ['Diproses', 'Revisi', 'Selesai'].includes(item.status)
      );
      setRequests(filtered);
    } catch (error) {
      console.error(error.response?.data?.message || 'Gagal mengambil data.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (requestId, fileList) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);
    const existing = selectedFiles[requestId] || [];
    const merged = [...existing, ...incoming];

    if (merged.length > MAX_FILES) {
      alert(`Maksimal ${MAX_FILES} file per upload.`);
      return;
    }

    const oversized = incoming.find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      alert(`File "${oversized.name}" melebihi batas 200 MB.`);
      return;
    }

    setSelectedFiles((prev) => ({ ...prev, [requestId]: merged }));
  };

  const handleRemoveFile = (requestId, idx) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [requestId]: (prev[requestId] || []).filter((_, i) => i !== idx),
    }));
  };

  const handleUpload = async (requestId) => {
    const files = selectedFiles[requestId];
    if (!files || files.length === 0) {
      alert('Pilih minimal satu file terlebih dahulu.');
      return;
    }

    const formData = new FormData();
    files.forEach((f) => formData.append('result_file', f));

    try {
      setUploadingId(requestId);
      const response = await API.post(`/requests/${requestId}/upload-result`, formData);
      alert(response.data.message || 'Berhasil diupload.');
      setSelectedFiles((prev) => ({ ...prev, [requestId]: [] }));
      getRequestsNeedUpload();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal upload.');
    } finally {
      setUploadingId(null);
    }
  };

  const toggleHistory = (requestId) => {
    setExpandedHistory((prev) => ({ ...prev, [requestId]: !prev[requestId] }));
  };

  const getUploadDestination = (status) =>
    status === 'Selesai' ? 'folder Final' : 'folder Draft';

  const formatTimestamp = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="member-layout">
      <Sidebar user={user} active="upload" onLogout={handleLogout} />

      <main className="member-main">
        <header className="upload-header">
          <h1>Upload Hasil Konten</h1>
        </header>

        <section className="upload-result-content">
          <div className="upload-result-card">
            <div className="upload-card-title">
              <h2>Request yang Perlu Upload Hasil</h2>
            </div>

            {loading ? (
              <div className="upload-empty">
                <h3>Memuat data...</h3>
                <p>Mohon tunggu sebentar.</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="upload-empty">
                <h3>Tidak ada request yang perlu diupload</h3>
                <p>Request dengan status Diproses, Revisi, atau Selesai akan muncul di sini.</p>
              </div>
            ) : (
              <div className="upload-request-list">
                {requests.map((item) => {
                  const filesForThis = selectedFiles[item.id] || [];
                  const isHistoryOpen = expandedHistory[item.id] || false;

                  // Parse riwayat file yang sudah pernah diupload
                  let uploadedFiles = [];
                  try {
                    if (item.result_drive_files) {
                      uploadedFiles =
                        typeof item.result_drive_files === 'string'
                          ? JSON.parse(item.result_drive_files)
                          : item.result_drive_files;
                    }
                  } catch {
                    uploadedFiles = [];
                  }

                  return (
                    <div className="upload-request-item" key={item.id}>
                      {/* Top row */}
                      <div className="upload-request-top">
                        <div>
                          <div className="upload-request-meta">
                            <span className="upload-request-code">
                              {item.request_code || `REQ-${String(item.id).padStart(3, '0')}`}
                            </span>
                            <span className="upload-request-deadline">
                              {formatTimestamp(item.deadline)}
                            </span>
                          </div>
                          <h3>{item.title}</h3>
                        </div>
                        <span className={getStatusClass(item.status)}>
                          {item.status}
                        </span>
                      </div>

                      {/* Upload destination info */}
                      <p className="upload-destination-info">
                        File akan diunggah ke{' '}
                        <strong>{getUploadDestination(item.status)}</strong>
                      </p>

                      {/* Drop zone */}
                      <label className="upload-result-box">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.mp4,.mov,.webm,.avi,.pptx,.xlsx"
                          onChange={(e) =>
                            handleFileChange(item.id, e.target.files)
                          }
                        />
                        <div className="upload-result-icon">⇧</div>
                        <p>
                          {filesForThis.length > 0
                            ? `${filesForThis.length} file dipilih — klik untuk tambah lagi`
                            : `Klik untuk pilih file · Maks ${MAX_FILES} file, 200 MB/file`}
                        </p>
                      </label>

                      {/* File list yang dipilih */}
                      {filesForThis.length > 0 && (
                        <ul className="upload-selected-file-list">
                          {filesForThis.map((file, idx) => (
                            <li key={`${file.name}-${idx}`}>
                              <span className="file-icon">📄</span>
                              <span className="file-name">{file.name}</span>
                              <span className="file-size">
                                {formatFileSize(file.size)}
                              </span>
                              <button
                                type="button"
                                className="file-remove-btn"
                                onClick={() =>
                                  handleRemoveFile(item.id, idx)
                                }
                              >
                                ✕
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Tombol upload */}
                      <button
                        type="button"
                        className="upload-submit-btn"
                        onClick={() => handleUpload(item.id)}
                        disabled={
                          uploadingId === item.id ||
                          filesForThis.length === 0
                        }
                      >
                        {uploadingId === item.id
                          ? 'Mengupload...'
                          : `Upload ${
                              filesForThis.length > 0
                                ? `${filesForThis.length} File`
                                : 'Hasil'
                            }`}
                      </button>

                      {/* Riwayat upload sebelumnya */}
                      {uploadedFiles.length > 0 && (
                        <div className="upload-history">
                          <button
                            className="upload-history-toggle"
                            onClick={() => toggleHistory(item.id)}
                          >
                            <span>
                              📁 Riwayat upload ({uploadedFiles.length} file)
                            </span>
                            <span className="toggle-icon">
                              {isHistoryOpen ? '▲' : '▼'}
                            </span>
                          </button>

                          {isHistoryOpen && (
                            <ul className="upload-history-list">
                              {uploadedFiles.map((f, idx) => (
                                <li
                                  key={idx}
                                  className="upload-history-item"
                                >
                                  <span className="file-icon">📄</span>
                                  <div className="history-file-info">
                                    <span className="file-name">
                                      {f.name ||
                                        f.originalFilename ||
                                        `File ${idx + 1}`}
                                    </span>
                                    {f.size && (
                                      <span className="file-size">
                                        {formatFileSize(f.size)}
                                      </span>
                                    )}
                                  </div>
                                  {f.webViewLink && (
                                    <a
                                      href={f.webViewLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="history-view-btn"
                                    >
                                      Lihat
                                    </a>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <button className="help-btn">?</button>
    </div>
  );
}

export default UploadResult;