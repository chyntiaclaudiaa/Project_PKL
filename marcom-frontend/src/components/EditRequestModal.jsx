import React, { useEffect, useState, useRef } from 'react';
import { Pencil } from 'lucide-react';
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

const PLATFORM_OPTIONS = ['Instagram', 'Website', 'YouTube', 'TikTok'];

/* Dropdown custom bergaya sama seperti di UserModal:
   klik untuk buka, chevron berputar, opsi aktif ditandai,
   dan boleh punya kotak pencarian untuk list yang panjang. */
const EditDropdown = ({
    label,
    required,
    placeholder,
    value,
    options,
    onSelect,
    error,
    searchable,
    search,
    onSearchChange,
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = searchable
        ? options.filter((opt) => opt.label.toLowerCase().includes((search || '').toLowerCase()))
        : options;

    const selectedLabel = options.find((opt) => String(opt.value) === String(value))?.label;

    return (
        <div className="edit-field edit-dropdown-wrapper" ref={ref}>
            <label>{label} {required && <span>*</span>}</label>

            <div
                className={`edit-dropdown-trigger ${error ? 'err' : ''}`}
                onClick={() => setOpen((prev) => !prev)}
            >
                <span className={selectedLabel ? 'edit-dropdown-value' : 'edit-dropdown-placeholder'}>
                    {selectedLabel || placeholder}
                </span>
                <svg
                    className={`edit-dropdown-chevron ${open ? 'open' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </div>

            {open && (
                <div className="edit-dropdown-menu">
                    {searchable && (
                        <div className="edit-dropdown-search" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                autoFocus
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Cari..."
                            />
                        </div>
                    )}

                    <ul className="edit-dropdown-options">
                        {filteredOptions.length === 0 ? (
                            <li className="edit-dropdown-empty">Tidak ditemukan</li>
                        ) : (
                            filteredOptions.map((opt) => (
                                <li
                                    key={opt.value}
                                    className={String(opt.value) === String(value) ? 'active' : ''}
                                    onClick={() => {
                                        onSelect(opt.value);
                                        setOpen(false);
                                    }}
                                >
                                    {opt.label}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {error && <small>{error}</small>}
        </div>
    );
};

const EditRequestModal = ({ requestId, onClose, onUpdated }) => {
    const [form, setForm] = useState(null);
    const [picOptions, setPicOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const [divisiSearch, setDivisiSearch] = useState('');
    const [picSearch, setPicSearch] = useState('');
    const [platformSearch, setPlatformSearch] = useState('');

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

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
            showToast(err.response?.data?.message || 'Gagal memuat data request.', 'error');
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

    const handleDropdownSelect = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.letter_number.trim()) e.letter_number = 'Nomor surat wajib diisi.';
        if (!form.entry_date) e.entry_date = 'Tanggal masuk wajib diisi.';
        if (!form.deadline) e.deadline = 'Tenggat wajib diisi.';
        if (!form.requester_division) e.requester_division = 'Divisi pengaju wajib dipilih.';
        if (!form.pic_id) e.pic_id = 'PIC wajib dipilih.';
        if (!form.platform_target) e.platform_target = 'Platform target wajib dipilih.';
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
            showToast('Perubahan berhasil disimpan.', 'success');
            if (onUpdated) onUpdated();
            setTimeout(() => onClose(), 800);
        } catch (err) {
            showToast(err.response?.data?.message || 'Gagal menyimpan perubahan.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!requestId) return null;

    const picDropdownOptions = picOptions.map((p) => ({ value: p.id, label: p.name }));
    const divisionDropdownOptions = DIVISION_OPTIONS.map((d) => ({ value: d, label: d }));
    const platformDropdownOptions = PLATFORM_OPTIONS.map((p) => ({ value: p, label: p }));

    return (
        <div className="edit-modal-overlay" onClick={handleBackdropClick}>
            {toast.show && (
                <div className={`edit-toast ${toast.type === 'error' ? 'edit-toast-error' : 'edit-toast-success'}`}>
                    {toast.message}
                </div>
            )}

            <div className="edit-modal">

                {/* Header */}
                <div className="edit-modal-header">
                    <div className="edit-header-left">
                        <span className="edit-modal-label">
                            <Pencil size={15} />
                            Edit Request
                        </span>
                    </div>
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

                                    <EditDropdown
                                        label="Divisi Pengaju"
                                        required
                                        placeholder="-- Pilih Divisi --"
                                        value={form.requester_division}
                                        options={divisionDropdownOptions}
                                        onSelect={(value) => handleDropdownSelect('requester_division', value)}
                                        error={errors.requester_division}
                                        searchable
                                        search={divisiSearch}
                                        onSearchChange={setDivisiSearch}
                                    />
                                </div>

                                {/* KOLOM KANAN */}
                                <div className="edit-col">

                                    <EditDropdown
                                        label="PIC yang Menangani"
                                        required
                                        placeholder="-- Pilih PIC --"
                                        value={form.pic_id}
                                        options={picDropdownOptions}
                                        onSelect={(value) => handleDropdownSelect('pic_id', value)}
                                        error={errors.pic_id}
                                        searchable
                                        search={picSearch}
                                        onSearchChange={setPicSearch}
                                    />

                                    <EditDropdown
                                        label="Platform Target"
                                        required
                                        placeholder="-- Pilih Platform --"
                                        value={form.platform_target}
                                        options={platformDropdownOptions}
                                        onSelect={(value) => handleDropdownSelect('platform_target', value)}
                                        error={errors.platform_target}
                                        searchable
                                        search={platformSearch}
                                        onSearchChange={setPlatformSearch}
                                    />

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