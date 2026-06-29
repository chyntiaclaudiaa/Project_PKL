import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import '../style/EditRequestModal.css';

const DIVISION_OPTIONS = [
    'Seluruh Divisi', 'Divisi Audit Internal', 'Divisi Human Capital',
    'Divisi Kepatuhan', 'Divisi Manajemen Risiko', 'Divisi Operasional',
    'Divisi Umum', 'Divisi Keuangan', 'Divisi Teknologi Informasi',
    'Divisi Tresuri', 'Divisi Funding & Wealth Management',
    'Divisi SME & Commercial', 'Unit Usaha Syariah', 'UKK APU & PPT',
    'Divisi Penyelamatan Kredit', 'Divisi Perencanaan Strategis',
    'Unit Strategi Anti Fraud', 'Digital Banking',
    'Corporate Culture & Service', 'Divisi Kredit Konsumer',
    'Divisi Credit Risk', 'UKK Commercial Business Center',
    'UKK Internal Control Over Financial Report',
    'Unit Kantor Eksternal/lain-lain',
];

const EditRequestModal = ({ requestId, onClose, onUpdated }) => {
    const [form, setForm] = useState(null);
    const [picOptions, setPicOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (requestId) {
            fetchDetail();
            fetchPicUsers();
        }
    }, [requestId]);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/requests/${requestId}`);
            const r = res.data.request;

            setForm({
                letter_number: r.letter_number || '',
                entry_date: toDatetimeLocal(r.entry_date),
                deadline: toDatetimeLocal(r.deadline),
                requester_division: r.requester_division || '',
                pic_id: r.pic_id || '',
                platform_target: r.platform_target || '',
                title: r.title || '',
                description: r.description || '',
                reminder_h7: r.reminder_h7 || false,
                reminder_h3: r.reminder_h3 || false,
                reminder_h1: r.reminder_h1 || false,
                reminder_deadline_day: r.reminder_deadline_day || false,
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal memuat data request.');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const fetchPicUsers = async () => {
        try {
            const res = await API.get('/requests/pic-users');
            setPicOptions(res.data || []);
        } catch {
            // silent
        }
    };

    const toDatetimeLocal = (val) => {
        if (!val) return '';
        const d = new Date(val);
        if (isNaN(d.getTime())) return '';
        // Format: YYYY-MM-DDTHH:MM
        return d.toISOString().slice(0, 16);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.letter_number.trim()) e.letter_number = 'Nomor surat wajib diisi.';
        if (!form.entry_date) e.entry_date = 'Tanggal masuk wajib diisi.';
        if (!form.deadline) e.deadline = 'Tenggat wajib diisi.';
        if (!form.requester_division) e.requester_division = 'Divisi pengaju wajib dipilih.';
        if (!form.title.trim()) e.title = 'Judul konten wajib diisi.';
        if (!form.description.trim()) e.description = 'Deskripsi wajib diisi.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            setSaving(true);
            await API.put(`/requests/${requestId}`, form);
            if (onUpdated) onUpdated();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan perubahan.');
        } finally {
            setSaving(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!requestId) return null;

    return (
        <div className="edit-modal-overlay" onClick={handleBackdropClick}>
            <div className="edit-modal">

                {/* Header */}
                <div className="edit-modal-header">
                    <div className="edit-header-left">
                        <span className="edit-modal-label">Edit Request</span>
                        <h2>{form?.title || '...'}</h2>
                    </div>
                    <button className="edit-modal-close" onClick={onClose}>✕ Batal</button>
                </div>

                {loading || !form ? (
                    <div className="edit-modal-loading">Memuat data...</div>
                ) : (
                    <>
                        <div className="edit-modal-body">
                            <div className="edit-form-grid">

                                {/* KOLOM KIRI */}
                                <div className="edit-col">

                                    <div className="edit-field">
                                        <label>Nomor Surat <span>*</span></label>
                                        <input
                                            type="text"
                                            name="letter_number"
                                            value={form.letter_number}
                                            onChange={handleChange}
                                            placeholder="001/MKT/VI/2026"
                                            className={errors.letter_number ? 'err' : ''}
                                        />
                                        {errors.letter_number && <small>{errors.letter_number}</small>}
                                    </div>

                                    <div className="edit-field">
                                        <label>Tanggal Masuk <span>*</span></label>
                                        <input
                                            type="datetime-local"
                                            name="entry_date"
                                            value={form.entry_date}
                                            onChange={handleChange}
                                            className={errors.entry_date ? 'err' : ''}
                                        />
                                        {errors.entry_date && <small>{errors.entry_date}</small>}
                                    </div>

                                    <div className="edit-field">
                                        <label>Tenggat <span>*</span></label>
                                        <input
                                            type="datetime-local"
                                            name="deadline"
                                            value={form.deadline}
                                            onChange={handleChange}
                                            className={errors.deadline ? 'err' : ''}
                                        />
                                        {errors.deadline && <small>{errors.deadline}</small>}
                                    </div>

                                    <div className="edit-field">
                                        <label>Divisi Pengaju <span>*</span></label>
                                        <select
                                            name="requester_division"
                                            value={form.requester_division}
                                            onChange={handleChange}
                                            className={errors.requester_division ? 'err' : ''}
                                        >
                                            <option value="">-- Pilih Divisi --</option>
                                            {DIVISION_OPTIONS.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        {errors.requester_division && <small>{errors.requester_division}</small>}
                                    </div>
                                </div>

                                {/* KOLOM KANAN */}
                                <div className="edit-col">

                                    <div className="edit-field">
                                        <label>PIC yang Menangani</label>
                                        <select
                                            name="pic_id"
                                            value={form.pic_id}
                                            onChange={handleChange}
                                        >
                                            <option value="">-- Pilih PIC --</option>
                                            {picOptions.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="edit-field">
                                        <label>Platform Target</label>
                                        <select
                                            name="platform_target"
                                            value={form.platform_target}
                                            onChange={handleChange}
                                        >
                                            <option value="">-- Pilih Platform --</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="Website">Website</option>
                                            <option value="YouTube">YouTube</option>
                                            <option value="TikTok">TikTok</option>
                                        </select>
                                    </div>

                                    <div className="edit-field">
                                        <label>Judul Konten <span>*</span></label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            placeholder="Judul konten..."
                                            className={errors.title ? 'err' : ''}
                                        />
                                        {errors.title && <small>{errors.title}</small>}
                                    </div>

                                    <div className="edit-field">
                                        <label>Deskripsi Kebutuhan <span>*</span></label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            placeholder="Jelaskan kebutuhan konten..."
                                            className={errors.description ? 'err' : ''}
                                            rows={4}
                                        />
                                        {errors.description && <small>{errors.description}</small>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="edit-modal-footer">
                            <button className="btn-cancel" onClick={onClose}>Batal</button>
                            <button
                                className="btn-save"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EditRequestModal;