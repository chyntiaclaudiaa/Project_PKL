import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    // State Navigasi Tab ('users' atau 'profile')
    const [activeTab, setActiveTab] = useState('users');

    // State Data Utama
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [adminData, setAdminData] = useState({ name: 'Admin Sistem', email: 'admin@marcom.com' });

    // State untuk Form Profil Admin
    const [profileEmail, setProfileEmail] = useState('');
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    // State Buka/Tutup Mata masing-masing kolom password di profil
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // State Modals Kelola User & Form
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    
    // State Notifikasi Sukses Hijau (Toast) & Eror
    const [toast, setToast] = useState({ show: false, message: '' });
    const [errorMsg, setErrorMsg] = useState('');
    const [passwordError, setPasswordError] = useState(''); 

    const divisiOptions = ['Marketing Communication', 'Creative', 'Digital', 'Administrator'];
    const jabatanOptions = ['System Admin', 'Manager MarCom', 'Staff Sponsorship', 'Staff Konten', 'Staff Event'];

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setAdminData(parsedUser);
            setProfileEmail(parsedUser.email);
        }
        fetchUsers();
    }, []);

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast({ show: false, message: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const fetchUsers = async (searchKey = '') => {
        try {
            const response = await API.get(`/admin/users?search=${searchKey}`);
            setUsers(response.data);
        } catch (err) {
            console.error('Gagal mengambil data user:', err);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        fetchUsers(e.target.value);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleRoleChange = (selectedRole, currentForm) => {
        let updatedJabatan = currentForm.jabatan;
        let updatedDivisi = currentForm.divisi;

        if (selectedRole === 'admin') {
            updatedJabatan = 'System Admin';
            updatedDivisi = 'Administrator';
        } else if (selectedRole === 'marcom_manager') {
            updatedJabatan = 'Manager MarCom';
            if (updatedDivisi === 'Administrator') updatedDivisi = 'Marketing Communication';
        } else if (selectedRole === 'marcom_member') {
            updatedJabatan = 'Staff Konten';
            if (updatedDivisi === 'Administrator') updatedDivisi = 'Marketing Communication';
        }

        setFormData({
            ...currentForm,
            role: selectedRole,
            jabatan: updatedJabatan,
            divisi: updatedDivisi
        });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            await API.post('/admin/users', formData);
            setIsAddModalOpen(false);
            resetForm();
            fetchUsers(search);
            setToast({ show: true, message: 'Pengguna berhasil ditambahkan!' });
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Gagal menambahkan pengguna baru.');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            await API.put(`/admin/users/${formData.id}`, {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                divisi: formData.divisi,
                jabatan: formData.jabatan,
                status: formData.status
            });
            setIsEditModalOpen(false);
            resetForm();
            fetchUsers(search);
            setToast({ show: true, message: 'Perubahan berhasil disimpan!' });
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Gagal memperbarui data pengguna.');
        }
    };

    const handleUpdateAdminEmail = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/admin/users/${adminData.id}`, {
                ...adminData,
                email: profileEmail
            });
            const updatedAdmin = { ...adminData, email: profileEmail };
            localStorage.setItem('user', JSON.stringify(updatedAdmin));
            setAdminData(updatedAdmin);
            setToast({ show: true, message: 'Email admin berhasil diperbarui!' });
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal memperbarui email.');
        }
    };

    const handleUpdateAdminPassword = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Konfirmasi password baru tidak cocok!');
            return;
        }

        try {
            await API.put(`/admin/users/${adminData.id}/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setIsResetPasswordOpen(false);
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
            setToast({ show: true, message: 'Password admin berhasil diperbarui!' });
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Password saat ini salah. Gagal memperbarui data.');
        }
    };

    const openEditModal = (user) => {
        setFormData({
            id: user.id,
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            divisi: user.divisi || 'Marketing Communication',
            jabatan: user.jabatan || 'Staff Konten',
            status: user.status
        });
        setIsEditModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ id: '', name: '', email: '', password: '', role: 'marcom_member', divisi: 'Marketing Communication', jabatan: 'Staff Konten', status: 'Aktif' });
        setErrorMsg('');
        setShowModalPassword(false);
    };

    const renderRoleBadge = (role) => {
        if (role === 'admin') return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600">Administrator</span>;
        if (role === 'marcom_manager') return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">Atasan / Manager</span>;
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-600">Anggota MarCom</span>;
    };

    // State form modal penambahan data user baru
    const [formData, setFormData] = useState({
        id: '', name: '', email: '', password: '', role: 'marcom_member', divisi: 'Marketing Communication', jabatan: 'Staff Konten', status: 'Aktif'
    });

    return (
        <div className="flex h-screen w-full bg-[#f4f6f9] font-sans overflow-hidden relative">
            
            {/* TRICK UNTUK MEMATIKAN MATA BAWAAN BROWSER (ANTI DOUBLE EYE ICON BUGS) */}
            <style>{`
                input::-ms-reveal,
                input::-ms-clear,
                input::-webkit-credentials-auto-fill-button {
                    display: none !important;
                    width: 0 !important;
                    height: 0 !important;
                }
            `}</style>
            
            {/* TOAST NOTIFIKASI HIJAU FLOATING */}
            {toast.show && (
                <div className="absolute top-5 right-5 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2 border border-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span className="text-sm font-bold">{toast.message}</span>
                </div>
            )}

            {/* SIDEBAR KIRI */}
            <div className="w-64 bg-[#0a1931] text-white flex flex-col justify-between p-4 shadow-xl flex-shrink-0">
                <div>
                    <div className="flex items-center space-x-3 p-2 mb-8">
                        <div className="bg-[#e95723] text-white font-bold p-2 rounded-lg text-xl w-9 h-9 flex items-center justify-center">C</div>
                        <div>
                            <h1 className="font-bold text-md leading-tight">COMET</h1>
                            <p className="text-[10px] text-gray-400">Marketing Communication</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <button 
                            type="button"
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                                activeTab === 'users' ? 'bg-[#e95723]/10 text-[#e95723] border-l-4 border-[#e95723]' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                </svg>
                                <span>Kelola Pengguna</span>
                            </div>
                            <span className="text-xs">{'>'}</span>
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                                activeTab === 'profile' ? 'bg-[#e95723]/10 text-[#e95723] border-l-4 border-[#e95723]' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.956 11.956 0 0 1 12 2.714Z" />
                                </svg>
                                <span>Profil Admin</span>
                            </div>
                            <span className="text-xs">{'>'}</span>
                        </button>
                    </nav>
                </div>

                <div className="border-t border-gray-700/50 pt-4">
                    <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl mb-3">
                        <div className="w-9 h-9 bg-[#e95723] rounded-full flex items-center justify-center font-bold text-white text-sm">{adminData.name.charAt(0)}</div>
                        <div className="overflow-hidden">
                            <h4 className="text-xs font-bold truncate text-gray-100">{adminData.name}</h4>
                            <p className="text-[10px] text-gray-400 truncate">{adminData.jabatan || 'System Admin'}</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleLogout} className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-gray-400 hover:text-red-400 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
                        <span>Keluar</span>
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{activeTab === 'users' ? 'Kelola Pengguna' : 'Profil Admin'}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {activeTab === 'users' ? `${users.length} pengguna terdaftar` : 'Pengaturan akun admin'}
                        </p>
                    </div>
                    {activeTab === 'users' && (
                        <button 
                            type="button"
                            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                            className="bg-[#e95723] hover:bg-[#d44b1c] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md transition flex items-center space-x-2"
                        >
                            <span>+ Tambah Pengguna</span>
                        </button>
                    )}
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    
                    {/* TAB KELOLA USER */}
                    {activeTab === 'users' && (
                        <>
                            <div className="mb-6 max-w-md relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
                                    </svg>
                                </span>
                                <input 
                                    type="text" value={search} onChange={handleSearchChange}
                                    placeholder="Cari nama, email, atau role..."
                                    className="w-full bg-white text-sm pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                />
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/70 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <th className="px-6 py-4">Nama</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Role / Jabatan</th>
                                            <th className="px-6 py-4">Divisi</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-8 text-gray-400">Tidak ada data pengguna ditemukan.</td>
                                            </tr>
                                        ) : (
                                            users.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50/50 transition">
                                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-full bg-orange-100 text-[#e95723] flex items-center justify-center font-bold text-xs">{user.name.charAt(0)}</div>
                                                            <span>{user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            {renderRoleBadge(user.role)}
                                                            <span className="text-[11px] text-gray-400 mt-0.5 ml-1">{user.jabatan || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">{user.divisi || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            user.status === 'Aktif' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === 'Aktif' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button type="button" onClick={() => openEditModal(user)} className="inline-flex items-center space-x-1 border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white shadow-sm transition">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                                            <span>Edit</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* TAB PROFIL ADMIN */}
                    {activeTab === 'profile' && (
                        <div className="max-w-2xl space-y-6 text-gray-800">
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                <div className="flex items-center space-x-2 text-blue-600 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0l-7.5-4.615a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                                    <h3 className="font-bold text-gray-900 text-md">Ubah Email</h3>
                                </div>
                                <form onSubmit={handleUpdateAdminEmail} className="space-y-4">
                                    <div className="max-w-md">
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Email Admin</label>
                                        <input 
                                            type="email" required value={profileEmail} 
                                            onChange={(e) => setProfileEmail(e.target.value)}
                                            className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm">
                                        Simpan Email
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2 text-orange-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>
                                        <h3 className="font-bold text-gray-900 text-md">Reset Password</h3>
                                    </div>
                                    
                                    <button 
                                        type="button" onClick={() => setIsResetPasswordOpen(!isResetPasswordOpen)}
                                        className="text-gray-400 hover:text-gray-600 transition focus:outline-none"
                                    >
                                        {isResetPasswordOpen ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-[#e95723]">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {isResetPasswordOpen && (
                                    <form onSubmit={handleUpdateAdminPassword} className="space-y-4 animate-fadeIn">
                                        
                                        {passwordError && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-xl max-w-md">{passwordError}</div>}
                                        
                                        {/* SUSUNAN FORM KEBAYAH (VERTIKAL BERBAGI BARIS YANG SAMA) */}
                                        <div className="flex flex-col max-w-md gap-4">
                                            
                                            {/* 1. PASSWORD SAAT INI */}
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Password Saat Ini</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showCurrentPassword ? 'text' : 'password'} required
                                                        value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                                        className="w-full bg-white pl-3 pr-10 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                                    />
                                                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                                        {showCurrentPassword ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822 3 3m-3-3-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* 2. PASSWORD BARU */}
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Password Baru</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showNewPassword ? 'text' : 'password'} required
                                                        value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                        className="w-full bg-white pl-3 pr-10 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                                    />
                                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                                        {showNewPassword ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822 3 3m-3-3-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* 3. KONFIRMASI PASSWORD */}
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Konfirmasi Password</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showConfirmPassword ? 'text' : 'password'} required
                                                        value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                        className="w-full bg-white pl-3 pr-10 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                                    />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                                        {showConfirmPassword ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822 3 3m-3-3-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button type="submit" className="bg-[#e95723] hover:bg-[#d44b1c] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm">
                                            Simpan Password
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* MODAL VIEW: TAMBAH / EDIT PENGGUNA */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{isAddModalOpen ? 'Tambah Pengguna' : 'Edit Pengguna'}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{isAddModalOpen ? 'Buat akun pengguna baru' : `Edit data: ${formData.name}`}</p>
                            </div>
                            <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-gray-400 hover:text-gray-600 text-sm font-semibold">✕ Batal</button>
                        </div>

                        <form onSubmit={isAddModalOpen ? handleAddUser : handleUpdateUser} className="p-6 space-y-4 text-gray-800">
                            {errorMsg && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">{errorMsg}</div>}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-600 block mb-1">Nama Lengkap *</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Chairun Nisaq" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600 block mb-1">Email *</label>
                                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="nama@marcom.com" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-600 block mb-1">{isAddModalOpen ? 'Password Sementara *' : 'Password (Kosongkan jika tidak diubah)'}</label>
                                    <div className="relative">
                                        <input 
                                            type={showModalPassword ? 'text' : 'password'}
                                            required={isAddModalOpen} value={formData.password} 
                                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                            className="w-full bg-white pl-3 pr-10 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" 
                                        />
                                        <button type="button" onClick={() => setShowModalPassword(!showModalPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                            {showModalPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822 3 3m-3-3-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600 block mb-1">Role Utama *</label>
                                    <select value={formData.role} onChange={(e) => handleRoleChange(e.target.value, formData)} className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="marcom_member">Anggota MarCom</option>
                                        <option value="marcom_manager">Atasan / Manager</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-600 block mb-1">Divisi / Unit *</label>
                                    <select value={formData.divisi} onChange={(e) => setFormData({...formData, divisi: e.target.value})} className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        {divisiOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600 block mb-1">Jabatan Spesifik *</label>
                                    <select value={formData.jabatan} onChange={(e) => setFormData({...formData, jabatan: e.target.value})} className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        {jabatanOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-600 block mb-1">Status Akun *</label>
                                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="Aktif">Aktif</option>
                                    <option value="Nonaktif">Nonaktif</option>
                                </select>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex justify-end space-x-2">
                                <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="px-4 py-2 text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition">Batal</button>
                                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[#e95723] hover:bg-[#d44b1c] rounded-xl shadow-md transition">
                                    {isAddModalOpen ? 'Simpan Pengguna' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;