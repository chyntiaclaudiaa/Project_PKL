import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal';
import { Bell, Save, FileText, ChevronDown, Search } from 'lucide-react';
import '../style/InputRequest.css';

const DIVISION_OPTIONS = [
    'Seluruh Divisi',
    'Divisi Audit Internal',
    'Divisi Human Capital',
    'Divisi Kepatuhan',
    'Divisi Manajemen Risiko',
    'Divisi Operasional',
    'Divisi Umum',
    'Divisi Keuangan',
    'Divisi Teknologi Informasi',
    'Divisi Tresuri',
    'Divisi Funding & Wealth Management',
    'Divisi SME & Commercial',
    'Unit Usaha Syariah',
    'UKK APU & PPT',
    'Divisi Penyelamatan Kredit',
    'Divisi Perencanaan Strategis',
    'Unit Strategi Anti Fraud',
    'Digital Banking',
    'Corporate Culture & Service',
    'Divisi Kredit Konsumen',
    'Divisi Credit Risk',
    'UKK Commercial Business Center',
    'UKK Internal Control Over Financial Report',
    'Unit Kantor Eksternal/lain-lain',
];

const PLATFORM_OPTIONS = ['Instagram', 'Website', 'YouTube', 'TikTok'];

/**
 * Dropdown pencarian generik.
 * Dipakai untuk PIC, Divisi Pengaju, dan Platform Target
 * supaya tampilan & perilakunya konsisten (satu style untuk semua).
 */
const SearchableDropdown = ({
    label,
    required,
    placeholder,
    value,
    displayValue,
    options,
    search,
    onSearchChange,
    isOpen,
    onToggle,
    onSelect,
    containerRef,
    error,
}) => {
    return (
        <div className="form-group" ref={containerRef}>
            <label>
                {label} {required && <span>*</span>}
            </label>

            <div className={`custom-dropdown ${isOpen ? 'dropdown-open' : ''} ${error ? 'input-error' : ''}`}>
                <button
                    type="button"
                    className="dropdown-toggle"
                    onClick={onToggle}
                >
                    <span className={value ? 'dropdown-value' : 'dropdown-placeholder'}>
                        {value ? displayValue : placeholder}
                    </span>
                    <ChevronDown
                        size={16}
                        className={`dropdown-chevron ${isOpen ? 'open' : ''}`}
                    />
                </button>

                {isOpen && (
                    <div className="dropdown-menu">
                        <div className="dropdown-search">
                            <Search size={14} />
                            <input
                                type="text"
                                autoFocus
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Cari..."
                            />
                        </div>

                        <div className="dropdown-options">
                            {options.length === 0 ? (
                                <div className="dropdown-empty">
                                    Tidak ditemukan
                                </div>
                            ) : (
                                options.map((opt) => (
                                    <div
                                        key={opt.value}
                                        className={`dropdown-option ${
                                            opt.value === value ? 'active' : ''
                                        }`}
                                        onClick={() => onSelect(opt.value)}
                                    >
                                        {opt.label}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && <small>{error}</small>}
        </div>
    );
};

const InputRequest = () => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const [isPicDropdownOpen, setIsPicDropdownOpen] = useState(false);
    const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
    const [isDivisionDropdownOpen, setIsDivisionDropdownOpen] = useState(false);

    const [picSearch, setPicSearch] = useState("");
    const [platformSearch, setPlatformSearch] = useState("");
    const [divisionSearch, setDivisionSearch] = useState("");

    const picRef = useRef(null);
    const platformRef = useRef(null);
    const divisionRef = useRef(null);

    const [form, setForm] = useState({
        letter_number: '',
        entry_date: '',
        deadline: '',
        title: '',
        requester_division: '',
        platform_target: '',
        pic_id: '',
        description: '',
        reminder_h7: false,
        reminder_h3: true,
        reminder_h1: true,
        reminder_deadline_day: true,
    });

    const [picOptions, setPicOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [calendarStatus, setCalendarStatus] = useState({
        connected: false,
        loading: true,
    });

    const [connectingGoogle, setConnectingGoogle] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        getPicUsers();
        getCalendarStatus();
    }, []);

    // Tutup dropdown ketika klik di luar area dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (picRef.current && !picRef.current.contains(e.target)) {
                setIsPicDropdownOpen(false);
            }
            if (platformRef.current && !platformRef.current.contains(e.target)) {
                setIsPlatformDropdownOpen(false);
            }
            if (divisionRef.current && !divisionRef.current.contains(e.target)) {
                setIsDivisionDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getPicUsers = async () => {
        try {
            const response = await API.get('/requests/pic-users');
            setPicOptions(response.data || []);
        } catch (err) {
            console.error(
                err.response?.data?.message ||
                'Gagal mengambil daftar PIC.'
            );
        }
    };

    const getCalendarStatus = async () => {
        try {
            const response = await API.get('/profile/calendar-status');

            setCalendarStatus({
                connected: Boolean(response.data.connected),
                loading: false,
            });
        } catch {
            setCalendarStatus({
                connected: false,
                loading: false,
            });
        }
    };

    const handleConnectGoogle = async () => {
        try {
            setConnectingGoogle(true);

            const response = await API.get('/google/connect');
            window.location.href = response.data.url;
        } catch (err) {
            console.error(err);
            showToast('Gagal membuka halaman koneksi Google.', 'error');
            setConnectingGoogle(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: '',
        }));
    };

    // Handler khusus untuk dropdown custom (PIC, Divisi, Platform)
    const handleDropdownSelect = (name, value) => {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: '',
        }));

        setIsPicDropdownOpen(false);
        setIsPlatformDropdownOpen(false);
        setIsDivisionDropdownOpen(false);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.letter_number.trim())
            newErrors.letter_number = 'Nomor surat wajib diisi.';

        if (!form.entry_date)
            newErrors.entry_date = 'Tanggal masuk wajib diisi.';

        if (!form.deadline)
            newErrors.deadline = 'Tenggat wajib diisi.';

        if (!form.title.trim())
            newErrors.title = 'Judul konten wajib diisi.';

        if (!form.requester_division)
            newErrors.requester_division = 'Divisi pengaju wajib dipilih.';

        if (!form.pic_id)
            newErrors.pic_id = 'PIC wajib dipilih.';

        if (!form.platform_target)
            newErrors.platform_target = 'Platform target wajib dipilih.';

        if (!form.description.trim())
            newErrors.description = 'Deskripsi kebutuhan wajib diisi.';

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setShowConfirm(true);
    };

    const handleConfirmSubmit = async () => {
        const payload = {
            letter_number: form.letter_number,
            entry_date: form.entry_date,
            deadline: form.deadline,
            title: form.title,
            requester_division: form.requester_division,
            description: form.description,
            platform_target: form.platform_target || null,
            pic_id: form.pic_id || null,
            reminder_h7: form.reminder_h7,
            reminder_h3: form.reminder_h3,
            reminder_h1: form.reminder_h1,
            reminder_deadline_day: form.reminder_deadline_day,
        };

        try {
            setLoading(true);
            setShowConfirm(false);

            const response = await API.post('/requests', payload);

            await getCalendarStatus();

            showToast(response.data.message || 'Request berhasil disimpan.', 'success');

            setTimeout(() => navigate('/anggota/dashboard'), 1200);
        } catch (err) {
            showToast(
                err.response?.data?.message || 'Gagal menyimpan request.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    // Data untuk masing-masing dropdown (dihitung di luar JSX, bukan di dalam map)
    const filteredPicOptions = picOptions
        .filter((pic) => pic.name.toLowerCase().includes(picSearch.toLowerCase()))
        .map((pic) => ({ value: pic.id, label: pic.name }));

    const selectedPicName =
        picOptions.find((pic) => String(pic.id) === String(form.pic_id))?.name || '';

    const filteredPlatformOptions = PLATFORM_OPTIONS
        .filter((p) => p.toLowerCase().includes(platformSearch.toLowerCase()))
        .map((p) => ({ value: p, label: p }));

    const filteredDivisionOptions = DIVISION_OPTIONS
        .filter((div) => div.toLowerCase().includes(divisionSearch.toLowerCase()))
        .map((div) => ({ value: div, label: div }));

    return (
        <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar
                user={user}
                active="request"
                onLogout={handleLogout}
            />

            {/* Toast */}
            {toast.show && (
                <div className={`toast-notif ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                    {toast.message}
                </div>
            )}

            {/* Confirm Modal */}
            {showConfirm && (
                <ConfirmModal
                    title="Simpan Request Konten"
                    message="Apakah Anda yakin ingin menyimpan request konten ini? Pastikan semua data sudah benar."
                    confirmText="Simpan"
                    cancelText="Batal"
                    type="info"
                    onConfirm={handleConfirmSubmit}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            <main className="dashboard-content">
                <div className="input-request-page">
                    <div className="input-header">
                        <h1>Input Request Konten</h1>
                    </div>

                    <form
                        className="input-request-wrapper"
                        onSubmit={handleSubmit}
                    >
                        <section className="request-form-card">
                            <h2>
                                <FileText size={20} />
                                Data Request Konten
                            </h2>

                            <div className="request-form-grid">

                                <div className="form-group">
                                    <label>
                                        Nomor Surat <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="letter_number"
                                        value={form.letter_number}
                                        onChange={handleChange}
                                        placeholder="001/MKT/VI/2026"
                                        className={
                                            errors.letter_number
                                                ? 'input-error'
                                                : ''
                                        }
                                    />

                                    {errors.letter_number && (
                                        <small>{errors.letter_number}</small>
                                    )}
                                </div>

                                <SearchableDropdown
                                    label="PIC yang Menangani"
                                    required
                                    placeholder="Pilih PIC"
                                    value={form.pic_id}
                                    displayValue={selectedPicName}
                                    options={filteredPicOptions}
                                    search={picSearch}
                                    onSearchChange={setPicSearch}
                                    isOpen={isPicDropdownOpen}
                                    onToggle={() => setIsPicDropdownOpen((prev) => !prev)}
                                    onSelect={(value) => handleDropdownSelect('pic_id', value)}
                                    containerRef={picRef}
                                    error={errors.pic_id}
                                />

                                <div className="form-group">
                                    <label>
                                        Tanggal Masuk <span>*</span>
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="entry_date"
                                        value={form.entry_date}
                                        onChange={handleChange}
                                        className={
                                            errors.entry_date
                                                ? 'input-error'
                                                : ''
                                        }
                                    />

                                    {errors.entry_date && (
                                        <small>{errors.entry_date}</small>
                                    )}
                                </div>

                                <SearchableDropdown
                                    label="Platform Target"
                                    required
                                    placeholder="Pilih Platform"
                                    value={form.platform_target}
                                    displayValue={form.platform_target}
                                    options={filteredPlatformOptions}
                                    search={platformSearch}
                                    onSearchChange={setPlatformSearch}
                                    isOpen={isPlatformDropdownOpen}
                                    onToggle={() => setIsPlatformDropdownOpen((prev) => !prev)}
                                    onSelect={(value) => handleDropdownSelect('platform_target', value)}
                                    containerRef={platformRef}
                                    error={errors.platform_target}
                                />

                                <div className="form-group">
                                    <label>
                                        Tenggat<span>*</span>
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="deadline"
                                        value={form.deadline}
                                        onChange={handleChange}
                                        className={
                                            errors.deadline
                                                ? 'input-error'
                                                : ''
                                        }
                                    />

                                    {errors.deadline && (
                                        <small>{errors.deadline}</small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Judul Konten <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Judul konten..."
                                        className={
                                            errors.title
                                                ? 'input-error'
                                                : ''
                                        }
                                    />

                                    {errors.title && (
                                        <small>{errors.title}</small>
                                    )}
                                </div>

                                <SearchableDropdown
                                    label="Divisi Pengaju"
                                    required
                                    placeholder="Pilih Divisi"
                                    value={form.requester_division}
                                    displayValue={form.requester_division}
                                    options={filteredDivisionOptions}
                                    search={divisionSearch}
                                    onSearchChange={setDivisionSearch}
                                    isOpen={isDivisionDropdownOpen}
                                    onToggle={() => setIsDivisionDropdownOpen((prev) => !prev)}
                                    onSelect={(value) => handleDropdownSelect('requester_division', value)}
                                    containerRef={divisionRef}
                                    error={errors.requester_division}
                                />

                                <div className="form-group">
                                    <label>
                                        Deskripsi Kebutuhan <span>*</span>
                                    </label>

                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Jelaskan kebutuhan konten secara detail..."
                                        className={
                                            errors.description
                                                ? 'input-error'
                                                : ''
                                        }
                                    />

                                    {errors.description && (
                                        <small>{errors.description}</small>
                                    )}
                                </div>

                            </div>
                        </section>

                        <section className="reminder-card">
                            <h2>
                                <Bell size={20} />
                                Preferensi Reminder
                            </h2>

                            <div className="reminder-list">
                                {[
                                    {
                                        name: 'reminder_h7',
                                        label: 'H-7 sebelum tenggat',
                                    },
                                    {
                                        name: 'reminder_h3',
                                        label: 'H-3 sebelum tenggat',
                                    },
                                    {
                                        name: 'reminder_h1',
                                        label: 'H-1 sebelum tenggat',
                                    },
                                    {
                                        name: 'reminder_deadline_day',
                                        label: 'Pada hari tenggat',
                                    },
                                ].map(({ name, label }) => (
                                    <label key={name}>
                                        <input
                                            type="checkbox"
                                            name={name}
                                            checked={form[name]}
                                            onChange={handleChange}
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={handleConnectGoogle}
                                disabled={
                                    calendarStatus.connected ||
                                    connectingGoogle
                                }
                                className={
                                    calendarStatus.connected
                                        ? 'calendar-connected'
                                        : 'calendar-connected calendar-disconnected'
                                }
                            >
                                <div>
                                    {calendarStatus.loading
                                        ? 'Mengecek Google Calendar...'
                                        : connectingGoogle
                                        ? 'Menghubungkan...'
                                        : calendarStatus.connected
                                        ? 'Google Calendar Terhubung'
                                        : 'Hubungkan Google Calendar'}
                                </div>

                                <p>
                                    {calendarStatus.loading
                                        ? 'Cek'
                                        : connectingGoogle
                                        ? 'Proses...'
                                        : calendarStatus.connected
                                        ? 'Aktif'
                                        : 'Klik untuk Hubungkan'}
                                </p>
                            </button>
                        </section>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="save-request-btn"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Menyimpan...'
                                    : 'Simpan Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default InputRequest;