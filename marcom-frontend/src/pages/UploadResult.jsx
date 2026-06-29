import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal';
import { Upload, X, ChevronDown, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import '../style/MemberDashboard.css';
import '../style/UploadResult.css';

const getStatusClass = (status) => {
  if (status === 'Diproses') return 'upload-status process';
  if (status === 'Revisi') return 'upload-status revision';
  if (status === 'Selesai') return 'upload-status completed';
  return 'upload-status';
};

const getStatusLabel = (status) => {
  if (status === 'Diproses') return 'Diproses';
  if (status === 'Revisi') return 'Perlu Revisi';
  if (status === 'Selesai') return 'Selesai';
  return status;
};

function UploadResult() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [expandedHistory, setExpandedHistory] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [comments, setComments] = useState({});
  const [sendingComment, setSendingComment] = useState({});

  // --- Modal state ---
  const [modal, setModal] = useState({ open: false });

  const closeModal = () => setModal({ open: false });

  /**
   * showNotif — wrapper untuk notifikasi sederhana (tanpa aksi confirm khusus)
   * @param {string} title
   * @param {string} message
   * @param {'warning'|'danger'} type
   */
  const showNotif = (title, message, type = 'warning') => {
    setModal({
      open: true,
      title,
      message,
      type,
      confirmText: 'OK',
      cancelText: 'Tutup',
      onConfirm: closeModal,
      onCancel: closeModal,
    });
  };

  const user = JSON.parse(localStorage.getItem('user'));

  const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB
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
        ['Diproses', 'Revisi'].includes(item.status)
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
      showNotif(
        'Batas File Tercapai',
        `Maksimal ${MAX_FILES} file per upload. Hapus beberapa file lama sebelum menambah yang baru.`,
        'warning'
      );
      return;
    }

    const oversized = incoming.find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      showNotif(
        'File Terlalu Besar',
        `"${oversized.name}" melebihi batas 200 MB. Kompres atau potong file terlebih dahulu.`,
        'warning'
      );
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
      showNotif(
        'Belum Ada File',
        'Pilih minimal satu file sebelum mengirim.',
        'warning'
      );
      return;
    }

    const formData = new FormData();
    files.forEach((f) => formData.append('result_file', f));

    try {
      setUploadingId(requestId);
      const response = await API.post(`/requests/${requestId}/upload-result`, formData);
      setSelectedFiles((prev) => ({ ...prev, [requestId]: [] }));
      getRequestsNeedUpload();
      showNotif(
        'Upload Berhasil',
        response.data.message || 'File berhasil dikirim ke Google Drive.',
        'warning'
      );
    } catch (error) {
      // Error message yang informatif untuk membantu debug Google Drive
      let errMsg = 'Gagal mengupload file.';

      if (error.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error.response?.status === 413) {
        errMsg = 'Ukuran file terlalu besar untuk diterima server (lebih dari limit server). Coba upload satu per satu.';
      } else if (error.response?.status === 500) {
        errMsg = 'Terjadi kesalahan di server. Kemungkinan koneksi Google Drive bermasalah — hubungi admin untuk cek service account atau token Google Drive.';
      } else if (error.response?.status === 403) {
        errMsg = 'Akses ditolak. Periksa izin Google Drive atau hubungi admin.';
      } else if (!error.response) {
        errMsg = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      }

      showNotif('Upload Gagal', errMsg, 'danger');
    } finally {
      setUploadingId(null);
    }
  };

  const handleCommentChange = (requestId, text) => {
    setComments((prev) => ({ ...prev, [requestId]: text }));
  };

  const handleSendComment = async (requestId) => {
    const commentText = comments[requestId];
    if (!commentText || !commentText.trim()) {
      showNotif('Komentar Kosong', 'Tulis komentar terlebih dahulu sebelum mengirim.', 'warning');
      return;
    }

    try {
      setSendingComment((prev) => ({ ...prev, [requestId]: true }));
      await API.post(`/requests/${requestId}/comments`, { comment: commentText });
      setComments((prev) => ({ ...prev, [requestId]: '' }));
      getRequestsNeedUpload();
      showNotif('Komentar Terkirim', 'Catatan kamu berhasil dikirim ke atasan.', 'warning');
    } catch (error) {
      showNotif(
        'Gagal Mengirim',
        error.response?.data?.message || 'Komentar gagal dikirim. Coba lagi beberapa saat.',
        'danger'
      );
    } finally {
      setSendingComment((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const toggleHistory = (requestId) => {
    setExpandedHistory((prev) => ({ ...prev, [requestId]: !prev[requestId] }));
  };

  const toggleComments = (requestId) => {
    setExpandedComments((prev) => ({ ...prev, [requestId]: !prev[requestId] }));
  };

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
              <div className="upload-title-stats">
                <span className="stat uploaded">
                  <CheckCircle size={14} />
                  {requests.filter(r => {
                    try {
                      const files = typeof r.result_drive_files === 'string'
                        ? JSON.parse(r.result_drive_files)
                        : r.result_drive_files;
                      return files && files.length > 0;
                    } catch {
                      return false;
                    }
                  }).length} Sudah Dikirim
                </span>
                <span className="stat pending">
                  <AlertCircle size={14} />
                  {requests.filter(r => {
                    try {
                      const files = typeof r.result_drive_files === 'string'
                        ? JSON.parse(r.result_drive_files)
                        : r.result_drive_files;
                      return !files || files.length === 0;
                    } catch {
                      return true;
                    }
                  }).length} Belum Dikirim
                </span>
              </div>
            </div>

            {loading ? (
              <div className="upload-empty">
                <h3>Memuat data...</h3>
                <p>Mohon tunggu sebentar.</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="upload-empty">
                <h3>Tidak ada request yang perlu diupload</h3>
                <p>Request dengan status Diproses atau Perlu Revisi akan muncul di sini.</p>
              </div>
            ) : (
              <div className="upload-request-list">
                {requests.map((item) => {
                  const filesForThis = selectedFiles[item.id] || [];
                  const isHistoryOpen = expandedHistory[item.id] || false;
                  const isCommentsOpen = expandedComments[item.id] || false;
                  const commentText = comments[item.id] || '';

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
                    <div
                      className={`upload-request-item ${uploadedFiles.length > 0 ? 'has-upload' : 'pending-upload'}`}
                      key={item.id}
                    >
                      {/* Top row */}
                      <div className="upload-request-top">
                        <div className="upload-request-info">
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
                        <div className="upload-request-badges">
                          {uploadedFiles.length > 0 ? (
                            <span className="upload-status-badge uploaded">
                              <CheckCircle size={16} />
                              Sudah Dikirim
                            </span>
                          ) : (
                            <span className="upload-status-badge pending">
                              <AlertCircle size={16} />
                              Belum Dikirim
                            </span>
                          )}
                          <span className={getStatusClass(item.status)}>
                            {getStatusLabel(item.status)}
                          </span>
                        </div>
                      </div>

                      <div className="upload-section">
                        <label className={`upload-result-box ${uploadedFiles.length > 0 ? 'has-history' : ''}`}>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.mp4,.mov,.webm,.avi,.pptx,.xlsx"
                            onChange={(e) => handleFileChange(item.id, e.target.files)}
                          />
                          <div className="upload-result-icon">
                            <Upload size={32} />
                          </div>
                          <p className="upload-result-text">
                            {filesForThis.length > 0
                              ? `${filesForThis.length} file dipilih — klik untuk tambah lagi`
                              : uploadedFiles.length > 0
                                ? 'Klik di sini untuk upload versi terbaru'
                                : 'Klik untuk pilih file · Maks 10 file, 200 MB/file'}
                          </p>
                        </label>

                        {/* File list yang dipilih (hanya muncul jika ada file baru) */}
                        {filesForThis.length > 0 && (
                          <ul className="upload-selected-file-list">
                            {filesForThis.map((file, idx) => (
                              <li key={`${file.name}-${idx}`}>
                                <span className="file-info">
                                  <span className="file-name">{file.name}</span>
                                  <span className="file-size">{formatFileSize(file.size)}</span>
                                </span>
                                <button type="button" className="file-remove-btn" onClick={() => handleRemoveFile(item.id, idx)}>
                                  <X size={18} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Tombol upload */}
                        <button
                          type="button"
                          className={`upload-submit-btn ${uploadedFiles.length > 0 ? 'secondary' : ''}`}
                          onClick={() => handleUpload(item.id)}
                          disabled={uploadingId === item.id || filesForThis.length === 0}
                        >
                          {uploadingId === item.id
                            ? 'Mengupload...'
                            : uploadedFiles.length > 0
                              ? 'Upload File Baru'
                              : 'Kirim File'}
                        </button>
                      </div>

                      {/* Riwayat upload sebelumnya */}
                      {uploadedFiles.length > 0 && (
                        <div className="upload-history">
                          <button
                            className="upload-history-toggle"
                            onClick={() => toggleHistory(item.id)}
                          >
                            <span> Riwayat versi ({uploadedFiles.length})</span>
                            <ChevronDown
                              size={18}
                              className={isHistoryOpen ? 'rotated' : ''}
                            />
                          </button>

                          {isHistoryOpen && (
                            <ul className="upload-history-list">
                              {uploadedFiles.map((f, idx) => (
                                <li key={idx} className="upload-history-item">
                                  <div className="history-file-info">
                                    <span className="file-name">
                                      {f.name || f.originalFilename || `File ${idx + 1}`}
                                    </span>
                                    <div className="history-meta">
                                      {f.size && (
                                        <span className="file-size">{formatFileSize(f.size)}</span>
                                      )}
                                      {f.uploadedAt && (
                                        <span className="upload-date">
                                          {formatTimestamp(f.uploadedAt)}
                                        </span>
                                      )}
                                    </div>
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

                      {/* Comments section */}
                      <div className="upload-comments-section">
                        <button
                          className="upload-comments-toggle"
                          onClick={() => toggleComments(item.id)}
                        >
                          <span>
                            <MessageSquare size={16} />
                            Catatan untuk Atasan
                          </span>
                          <ChevronDown
                            size={18}
                            className={isCommentsOpen ? 'rotated' : ''}
                          />
                        </button>

                        {isCommentsOpen && (
                          <div className="upload-comments-box">
                            <div className="upload-comment-input-area">
                              <textarea
                                value={commentText}
                                onChange={(e) => handleCommentChange(item.id, e.target.value)}
                                placeholder="Tambahkan catatan atau pertanyaan untuk atasan..."
                                className="upload-comment-input"
                              />
                              <button
                                className="upload-send-comment-btn"
                                onClick={() => handleSendComment(item.id)}
                                disabled={sendingComment[item.id] || !commentText.trim()}
                              >
                                <Send size={16} />
                                {sendingComment[item.id] ? 'Mengirim...' : 'Kirim'}
                              </button>
                            </div>

                            {item.comments && item.comments.length > 0 && (
                              <div className="upload-existing-comments">
                                <h4>Komentar dari Atasan:</h4>
                                <ul>
                                  {item.comments.map((comment, idx) => (
                                    <li key={idx} className="upload-comment-item">
                                      <div className="comment-header">
                                        <strong>{comment.user_name}</strong>
                                        <span className="comment-date">
                                          {formatTimestamp(comment.created_at)}
                                        </span>
                                      </div>
                                      <p>{comment.comment}</p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <button className="help-btn">?</button>

      {/* ConfirmModal untuk semua notifikasi */}
      {modal.open && (
        <ConfirmModal
          title={modal.title}
          message={modal.message}
          type={modal.type}
          confirmText={modal.confirmText}
          cancelText={modal.cancelText}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel}
        />
      )}
    </div>
  );
}

export default UploadResult;