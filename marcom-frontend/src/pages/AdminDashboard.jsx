import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import ProfilUser from '../components/ProfilUser'; 
import UserModal from '../components/UserModal'; // <-- Impor Komponen Baru
import logoKecilBankSumut from '../assets/Logo_Kecil_Bank_Sumut.png'; 

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users'); 

    // Sesi Utama Data Pengguna
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [adminData, setAdminData] = useState({ name: 'Admin Sistem', email: 'admin@marcom.com', role: 'admin', divisi: 'MarCom', jabatan: 'Administrator' });

    // State Modals & Toast
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    const [showAdminConfirmPassword, setShowAdminConfirmPassword] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [errorMsg, setErrorMsg] = useState('');

    // State Form
    const [formData, setFormData] = useState({
        id: '', name: '', email: '', password: '', adminPasswordConfirm: '', role: 'marcom_member', divisi: 'Divisi Marketing Communication', jabatan: '-', status: 'Aktif'
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setAdminData(JSON.parse(storedUser));
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
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

    const handleUpdateSubmitCheck = (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (formData.password && formData.password.length > 0) {
            setIsConfirmModalOpen(true);
        } else {
            executeUserUpdate();
        }
    };

    const executeUserUpdate = async (e) => {
        if (e) e.preventDefault(); 
        setErrorMsg('');

        try {
            await API.put(`/admin/users/${formData.id}`, {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                divisi: formData.divisi,
                jabatan: formData.jabatan,
                status: formData.status,
                password: formData.password || undefined,
                adminPasswordConfirm: formData.password ? formData.adminPasswordConfirm : undefined 
            });
            
            if (formData.password && formData.email === adminData.email) {
                setIsEditModalOpen(false);
                setIsConfirmModalOpen(false); 
                setShowLogoutAlert(true);
                return; 
            }

            setIsEditModalOpen(false);
            setIsConfirmModalOpen(false); 
            resetForm();
            fetchUsers(search);
            setToast({ show: true, message: 'Perubahan berhasil disimpan!' });
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Gagal memperbarui data pengguna.');
        }
    };

    const openEditModal = (user) => {
        setFormData({
            id: user.id,
            name: user.name,
            email: user.email,
            password: '',
            adminPasswordConfirm: '',
            role: user.role,
            divisi: user.divisi || 'Divisi Marketing Communication',
            jabatan: user.jabatan || '-',
            status: user.status
        });
        setIsEditModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ id: '', name: '', email: '', password: '', adminPasswordConfirm: '', role: 'marcom_member', divisi: 'Divisi Marketing Communication', jabatan: '-', status: 'Aktif' });
        setErrorMsg('');
        setShowAdminConfirmPassword(false);
        setIsConfirmModalOpen(false);
        setShowLogoutAlert(false);
    };

    const renderRoleBadge = (role) => {
    const baseClasses = "inline-block px-3 py-1 text-[10px] font-bold rounded-lg whitespace-normal text-center leading-tight";
    
    if (role === 'admin') 
        return <span className={`${baseClasses} bg-red-100 text-[#e63946]`}>Administrator</span>;
    
    if (role === 'marcom_manager') 
        return <span className={`${baseClasses} bg-blue-50 text-blue-600`}>Pimpinan Bidang</span>;
    
    return <span className={`${baseClasses} bg-green-50 text-green-600`}>Anggota MarCom</span>;
};

    return (
        <div className="flex h-screen w-full bg-[#f4f7fc] font-sans overflow-hidden relative select-none">
            
            {toast.show && (
                <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2 border border-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <span className="text-sm font-bold">{toast.message}</span>
                </div>
            )}

            <div className="w-64 bg-[#0d2757] text-white flex flex-col justify-between p-5 shadow-2xl flex-shrink-0">
                <div>
                    <div className="flex items-center space-x-3 mb-6 mt-2">
                        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                            <img src={logoKecilBankSumut} alt="Logo Bank Sumut" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="font-bold text-base leading-tight tracking-wide">Marcom System</h1>
                            <p className="text-[10px] text-slate-300 font-medium">Marketing Communication</p>
                        </div>
                    </div>

                    <div className="bg-[#1a386b] rounded-xl px-4 py-3 mb-8 border border-white/5">
                        <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Role Aktif</p>
                        <div className="flex items-center space-x-2 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-slate-300"><path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" /></svg>
                            <span className="text-xs font-bold text-white">Administrator</span>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <button type="button" onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-[#e95723]/15 text-[#e95723] shadow-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                            <span>Kelola Pengguna</span>
                        </button>
                        
                        <button type="button" onClick={() => setActiveTab('profile')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-[#e95723]/15 text-[#e95723] shadow-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.956 11.956 0 0 1 12 2.714Z" /></svg>
                            <span>Profil Admin</span>
                        </button>
                    </nav>
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-9 h-9 bg-[#e95723] rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0">{adminData.name.charAt(0)}</div>
                        <div className="overflow-hidden">
                            <h4 className="text-xs font-bold truncate text-gray-100">{adminData.name}</h4>
                            <p className="text-[10px] text-slate-400 truncate font-medium">{adminData.jabatan || 'Administrator'}</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleLogout} className="border border-white/20 hover:border-red-400 p-2 rounded-xl text-slate-300 hover:text-red-400 transition bg-transparent">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="px-10 py-6 flex items-center justify-between flex-shrink-0 bg-[#f4f7fc]">
                    <div>
                        <h2 className="text-2xl font-bold text-[#0d2757] tracking-tight">{activeTab === 'users' ? 'Kelola Pengguna' : 'Profil Admin'}</h2>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">{activeTab === 'users' ? `${users.length} Pengguna Terdaftar` : 'Pengaturan akun admin'}</p>
                    </div>
                    {activeTab === 'users' && (
                        <button type="button" onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="bg-[#e95723] hover:bg-[#d44b1c] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M11 5a1 1 0 1 1 2 0v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H7a1 1 0 1 1 0-2h4V5Z" /></svg>
                            <span>Tambah Pengguna</span>
                        </button>
                    )}
                </header>

                <main className="flex-1 px-10 pb-10 overflow-y-auto">
                    {activeTab === 'users' && (
                        <>
                            <div className="mb-6 max-w-md relative bg-white rounded-full shadow-sm border border-gray-200/60">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" /></svg>
                                </span>
                                <input type="text" value={search} onChange={handleSearchChange} placeholder="Cari nama, email, atau role..." className="w-full bg-transparent text-xs pl-11 pr-4 py-2.5 focus:outline-none text-gray-700 placeholder-slate-400 font-medium" />
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden p-4">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-gray-100">
                                            <th className="px-6 pl-16 py-4 font-bold">Nama</th>
                                            <th className="px-6 py-4 font-bold">Email</th>
                                            <th className="px-6 py-4 font-bold">Role</th>
                                            <th className="px-6 py-4 font-bold">Divisi / Unit</th>
                                            <th className="px-6 py-4 font-bold">Status</th>
                                            <th className="px-6 py-4 text-center font-bold">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs text-gray-700 font-medium">
                                        {users.length === 0 ? (
                                            <tr><td colSpan="6" className="text-center py-12 text-slate-400 font-semibold">Tidak ada data pengguna ditemukan.</td></tr>
                                        ) : (
                                            users.map((user) => {
                                                const currentStatus = (user.status || 'Nonaktif').toLowerCase();
                                                const isAktif = currentStatus === 'aktif';
                                                return (
                                                    <tr key={user.id} className="hover:bg-slate-50/40 transition-all border-b border-slate-50 last:border-none">
                                                        <td className="px-6 py-4 text-slate-800">
                                                            <div className="flex items-center">
                                                                <div className="w-8 h-8 rounded-full bg-orange-50 text-[#e95723] flex items-center justify-center font-bold text-xs border border-orange-100 flex-shrink-0 mr-5">{user.name?.charAt(0)}</div>
                                                                <div className="flex flex-col justify-center">
                                                                    <span className="font-bold text-slate-800 text-sm leading-tight">{user.name}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-[#3a60a8] font-semibold">{user.email}</td>
                                                        <td className="px-6 py-4">{renderRoleBadge(user.role)}</td>
                                                        <td className="px-6 py-4 text-slate-500 font-semibold">{user.divisi || '-'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border ${isAktif ? 'bg-green-50 text-emerald-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                                                <span className={`w-2 h-2 rounded-full mr-2 ${isAktif ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                                {isAktif ? 'Aktif' : 'Nonaktif'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button type="button" onClick={() => openEditModal(user)} className="p-2 border border-blue-100 hover:border-blue-300 text-blue-600 hover:bg-blue-50/50 rounded-xl transition bg-white shadow-sm">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'profile' && (
                        <ProfilUser userData={adminData} onUpdateUser={(updatedData) => setAdminData(updatedData)} setToast={setToast} />
                    )}
                </main>
            </div>

            {(isAddModalOpen || isEditModalOpen) && (
                <UserModal 
                    isOpen={true} 
                    isEdit={isEditModalOpen} 
                    onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={isAddModalOpen ? handleAddUser : handleUpdateSubmitCheck}
                    errorMsg={errorMsg}
                />
            )}

            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100">
                        <div className="p-6">
                            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-amber-600">
                                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            
                            <h3 className="text-center text-lg font-bold text-gray-900 mb-1.5">Konfirmasi Keamanan</h3>
                            <p className="text-center text-xs text-slate-500 mb-6 font-medium leading-relaxed">Anda terdeteksi mengubah password pengguna. Sesi ini memerlukan konfirmasi kredensial Admin asli Anda.</p>

                            {errorMsg && <div className="mb-5 p-3 bg-red-50 text-red-600 text-xs rounded-xl font-bold text-center border border-red-100">{errorMsg}</div>}

                            <form onSubmit={executeUserUpdate}>
                                <div className="relative mb-6">
                                    <input
                                        type={showAdminConfirmPassword ? 'text' : 'password'}
                                        required
                                        autoFocus
                                        value={formData.adminPasswordConfirm}
                                        onChange={(e) => setFormData({ ...formData, adminPasswordConfirm: e.target.value })}
                                        className="w-full bg-slate-50 pl-4 pr-10 py-3 border border-gray-200 focus:border-amber-500 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-gray-800 font-medium transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                                        placeholder="Ketik password admin Anda..."
                                    />
                                    <button type="button" onClick={() => setShowAdminConfirmPassword(!showAdminConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-amber-600 transition-colors">
                                        {showAdminConfirmPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822 3 3m-3-3-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                        )}
                                    </button>
                                </div>
                                <div className="flex space-x-3">
                                    <button type="button" onClick={() => { setIsConfirmModalOpen(false); setErrorMsg(''); }} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold rounded-xl transition-colors">Kembali</button>
                                    <button type="submit" className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-md transition-colors">Konfirmasi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showLogoutAlert && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center border border-slate-100">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">Password Diubah!</h3>
                        <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
                            Untuk alasan keamanan, sesi Anda saat ini diakhiri. Silakan login kembali menggunakan password baru Anda.
                        </p>
                        <button 
                            onClick={handleLogout} 
                            className="w-full bg-[#0d2757] hover:bg-[#1a386b] text-white text-sm font-bold py-3.5 rounded-xl shadow-md transition-all"
                        >
                            OK, Login Ulang
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;