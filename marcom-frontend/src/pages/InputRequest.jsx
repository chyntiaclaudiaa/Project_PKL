import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal';
import {
    FileText,
    User,
    Calendar,
    Monitor,
    Clock,
    PenSquare,
    Building2,
    FileEdit,
    Bell,
    Save
} from 'lucide-react';
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

const InputRequest = () => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

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

    useEffect(() => {
        getPicUsers();
        getCalendarStatus();
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
            alert('Gagal membuka halaman koneksi Google.');
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

            alert(response.data.message || 'Request berhasil disimpan.');

            navigate('/anggota/dashboard');
        } catch (err) {
            alert(
                err.response?.data?.message ||
                'Gagal menyimpan request.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                user={user}
                active="request"
                onLogout={handleLogout}
            />

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
                                        <FileEdit size={16} />
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

                                <div className="form-group">
                                    <label>
                                        <User size={16} />
                                        PIC yang Menangani
                                    </label>

                                    <select
                                        name="pic_id"
                                        value={form.pic_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            -- Pilih PIC --
                                        </option>

                                        {picOptions.map((pic) => (
                                            <option
                                                key={pic.id}
                                                value={pic.id}
                                            >
                                                {pic.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <Calendar size={16} />
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

                                <div className="form-group">
                                    <label>
                                        <Monitor size={16} />
                                        Platform Target
                                    </label>

                                    <select
                                        name="platform_target"
                                        value={form.platform_target}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            -- Pilih Platform --
                                        </option>
                                        <option value="Instagram">
                                            Instagram
                                        </option>
                                        <option value="Website">
                                            Website
                                        </option>
                                        <option value="YouTube">
                                            YouTube
                                        </option>
                                        <option value="TikTok">
                                            TikTok
                                        </option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <Clock size={16} />
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
                                        <PenSquare size={16} />
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

                                <div className="form-group">
                                    <label>
                                        <Building2 size={16} />
                                        Divisi Pengaju <span>*</span>
                                    </label>

                                    <select
                                        name="requester_division"
                                        value={form.requester_division}
                                        onChange={handleChange}
                                        className={
                                            errors.requester_division
                                                ? 'input-error'
                                                : ''
                                        }
                                    >
                                        <option value="">
                                            -- Pilih Divisi --
                                        </option>

                                        {DIVISION_OPTIONS.map((div) => (
                                            <option
                                                key={div}
                                                value={div}
                                            >
                                                {div}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.requester_division && (
                                        <small>
                                            {errors.requester_division}
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        <FileText size={16} />
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
                                <Save size={18} />
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