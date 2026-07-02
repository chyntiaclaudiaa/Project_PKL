import React, { useEffect, useState } from 'react';
import '../style/RequestDetail.css';
import API from '../api/axios';
import ConfirmModal from './ConfirmModal';

import {
    MessageCircle,
    Send,
    MoreVertical,
    ChevronDown,
    X,
    Trash2,
    AlertCircle
} from 'lucide-react';


const RequestDetailModal = ({ requestId, onClose, onUpdated, currentUserName, currentUserId }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [statusDropdown, setStatusDropdown] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ show: false, commentId: null });
    const [errorMessage, setErrorMessage] = useState('');

    const storedUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    })();
    const userId = currentUserId || storedUser?.id;
    const userName = currentUserName || storedUser?.name || 'Current User';

    useEffect(() => {
        if (requestId) {
            getRequestDetail();
        }
    }, [requestId]);

    // Tutup pop up kalau klik di luar cardnya
    useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenuId(null);
            setStatusDropdown(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Auto-hide error toast setelah beberapa detik
    useEffect(() => {
        if (!errorMessage) return;
        const timer = setTimeout(() => setErrorMessage(''), 4000);
        return () => clearTimeout(timer);
    }, [errorMessage]);

    const getRequestDetail = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await API.get(`/requests/${requestId}`);
            // Backend mengembalikan { request, comments, status_history }
            setDetail(response.data);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Gagal mengambil detail request.');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Send new comment
    const handleSendComment = async () => {
        if (!comment.trim()) {
            setErrorMessage('Komentar tidak boleh kosong.');
            return;
        }

        try {
            await API.post(`/requests/${requestId}/comments`, { comment });
            setComment('');
            // Refetch silent supaya user_name muncul dari JOIN di backend,
            // bukan dari localStorage yang bisa saja kosong/salah
            await getRequestDetail(true);
            if (onUpdated) onUpdated();
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Gagal mengirim komentar.');
        }
    };

    // Delete comment
    const handleDeleteComment = (commentId) => {
        setConfirmModal({ show: true, commentId });
    };

    const confirmDeleteComment = async () => {
        const commentId = confirmModal.commentId;
        setConfirmModal({ show: false, commentId: null });

        try {
            await API.delete(`/requests/${requestId}/comments/${commentId}`);

            setDetail(prev => ({
                ...prev,
                comments: prev.comments.filter(c => c.id !== commentId)
            }));

            setOpenMenuId(null);
            if (onUpdated) onUpdated();
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Gagal menghapus komentar.');
            console.error('Delete error:', err);
        }
    };

    // Request ini cuma boleh diubah statusnya oleh user yang sedang jadi PIC-nya.
    // Kalau kamu assign surat (bahkan surat buatan kamu sendiri) ke orang lain,
    // pic_id pindah ke orang itu dan kamu otomatis kehilangan akses ubah status.
    const isAssignedPic = !!detail && String(detail.request.pic_id) === String(userId);

    // Change request status
    const handleStatusChange = async (newStatus) => {
        // Lapis pengaman kedua di level fungsi, bukan cuma disembunyikan di UI —
        // supaya tetap aman walau dropdown-nya somehow ke-trigger.
        if (!isAssignedPic) {
            setErrorMessage('Anda bukan PIC yang ditugaskan pada request ini.');
            setStatusDropdown(false);
            return;
        }

        if (newStatus === detail.request.status) {
            setStatusDropdown(false);
            return;
        }

        try {
            setStatusLoading(true);
            const response = await API.put(`/requests/${requestId}/status`, {
                status: newStatus,
                note: `Status diubah menjadi ${newStatus}.`
            });

            // Update state lokal supaya langsung terlihat tanpa refetch
            setDetail(prev => ({
                ...prev,
                request: {
                    ...prev.request,
                    status: response.data.request.status
                }
            }));

            setStatusDropdown(false);
            if (onUpdated) onUpdated();
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Gagal mengubah status.');
        } finally {
            setStatusLoading(false);
        }
    };

    // Helper functions

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return dateString.includes('T') ? dateString.split('T')[0] : dateString;
    };

    const formatDateWithTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    if (!requestId) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const STATUS_OPTIONS = ['Menunggu', 'Diproses', 'Selesai', 'Revisi', 'Ditolak'];

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            {/* Error Toast (melayang, tidak menumpuk di dalam card) */}
            {errorMessage && (
                <div className="error-toast">
                    <AlertCircle size={16} />
                    <span>{errorMessage}</span>
                    <button
                        className="error-toast-close"
                        onClick={() => setErrorMessage('')}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {confirmModal.show && (
                <ConfirmModal
                    title="Hapus Komentar"
                    message="Apakah Anda yakin ingin menghapus komentar ini?"
                    confirmText="Hapus"
                    cancelText="Batal"
                    type="error"
                    onConfirm={confirmDeleteComment}
                    onCancel={() => setConfirmModal({ show: false, commentId: null })}
                />
            )}

            <div className="detail-modal">
                {loading ? (
                    <div className="modal-loading">Memuat detail request...</div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="modal-header">
                            <div className="header-top">
                                <span className="request-code">{detail.request.request_code}</span>
                                <button className="modal-close" onClick={onClose}>
                                    <X size={20} />
                                    <span>Batal</span>
                                </button>
                            </div>

                            <h2 className="header-title">{detail.request.title}</h2>

                            <div className="header-footer">
                                <span className={`status-badge ${getStatusClass(detail.request.status)}`}>
                                    {detail.request.status}
                                </span>

                                {isAssignedPic ? (
                                    <div
                                        className="status-dropdown-wrapper"
                                        onClick={e => e.stopPropagation()} // cegah trigger handleClickOutside
                                    >
                                        <span className="ubah-status-label">Ubah Status</span>
                                        <div className="status-dropdown-container">
                                            <button
                                                className="status-dropdown-btn"
                                                onClick={() => setStatusDropdown(prev => !prev)}
                                                disabled={statusLoading}
                                            >
                                                {statusLoading ? 'Menyimpan...' : detail.request.status}
                                                <ChevronDown size={16} className="dropdown-icon" />
                                            </button>

                                            {statusDropdown && (
                                                <div className="dropdown-menu">
                                                    {STATUS_OPTIONS.map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => handleStatusChange(s)}
                                                            className={detail.request.status === s ? 'active' : ''}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    // Bukan PIC yang ditugaskan pada request ini — status jadi read-only,
                                    // gak ada dropdown/tombol ubah sama sekali.
                                    <span className="status-readonly-note">
                                        Hanya PIC ({detail.request.pic_name || '-'}) yang bisa mengubah status ini.
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="modal-content">
                            {/* Detail Information */}
                            <section className="detail-card">
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Nomor Surat</label>
                                        <p>{detail.request.letter_number || '-'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Tanggal Masuk</label>
                                        <p>{formatDateWithTime(detail.request.entry_date)}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Tenggat</label>
                                        <p>{formatDateWithTime(detail.request.deadline)}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Divisi Pengaju</label>
                                        <p>{detail.request.requester_division || '-'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Platform</label>
                                        <p>{detail.request.platform_target || '-'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>PIC</label>
                                        <p>{detail.request.pic_name || '-'}</p>
                                    </div>
                                </div>

                                <div className="description-box">
                                    <label>Deskripsi Kebutuhan</label>
                                    <p>{detail.request.description || '-'}</p>
                                </div>
                            </section>

                            {/* Comment Section */}
                            <section className="comment-card">
                                <h3 className="comment-title">
                                    <MessageCircle size={18} className="comment-icon" />
                                    Komentar
                                </h3>

                                <div className="comment-list">
                                    {detail.comments.length === 0 ? (
                                        <p className="empty-comment">Belum ada komentar.</p>
                                    ) : (
                                        detail.comments.map((item) => (
                                            <div className="comment-item" key={item.id}>
                                                <div className="comment-avatar">
                                                    {getInitials(item.user_name)}
                                                </div>

                                                <div className="comment-content">
                                                    <div className="comment-meta">
                                                        <strong className="comment-name">{item.user_name}</strong>
                                                        <span className="comment-date">
                                                            {formatDateWithTime(item.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="comment-text">{item.comment}</p>
                                                </div>

                                                {/* Hanya tampilkan menu hapus kalau komentar milik user yang sedang login (id berupa UUID string) */}
                                                {String(item.user_id) === String(userId) && (
                                                    <div
                                                        className="comment-actions"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            className="comment-menu"
                                                            onClick={() =>
                                                                setOpenMenuId(openMenuId === item.id ? null : item.id)
                                                            }
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>

                                                        {openMenuId === item.id && (
                                                            <div className="comment-dropdown">
                                                                <button
                                                                    onClick={() => handleDeleteComment(item.id)}
                                                                    className="delete-btn"
                                                                >
                                                                    <Trash2 size={14} className="delete-icon" />
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="comment-input-row">
                                    <input
                                        type="text"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                                        placeholder="Tulis Balasan..."
                                        className="comment-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendComment}
                                        className="comment-send-btn"
                                        title="Kirim komentar"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const getStatusClass = (status) => {
    const map = {
        'Menunggu': 'waiting',
        'Diproses': 'process',
        'Selesai': 'done',
        'Revisi': 'revision',
        'Ditolak': 'rejected'
    };
    return map[status] || '';
};

export default RequestDetailModal;