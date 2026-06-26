import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const PasswordInput = ({ label, value, onChange, showPassword, setShowPassword, placeholder }) => (
    <div>
        <label className="text-xs font-bold text-slate-600 block mb-1">{label}</label>
        <div className="relative">
            <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder={placeholder}
                value={value} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 pr-12 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden" 
            />
            <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
                {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                )}
            </button>
        </div>
    </div>
);

const ProfilUser = ({ userData, onUpdateUser, setToast }) => {
    const [subTab, setSubTab] = useState('identitas'); 
    
    // State Form Identitas
    const [identityData, setIdentityData] = useState({ name: '', email: '' });
    const [identityError, setIdentityError] = useState('');

    // State Form Keamanan
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [emailData, setEmailData] = useState({ currentEmail: '', newEmail: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [emailError, setEmailError] = useState('');

    // State untuk visibility password (Eye Icon)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showEmailConfirmPassword, setShowEmailConfirmPassword] = useState(false);

    // State untuk Modal Logout
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [logoutMessage, setLogoutMessage] = useState({ title: '', desc: '' });

    useEffect(() => {
        if (userData) {
            setIdentityData({ name: userData.name || '', email: userData.email || '' });
            setEmailData(prev => ({ ...prev, currentEmail: userData.email }));
        }
    }, [userData]);

    const getEndpoint = (role, id) => {
        if (role === 'admin') return `/admin/users/${id}`;
        if (role === 'atasan' || role === 'marcom_manager') return `/atasan/profile/${id}`; 
        return `/anggota/profile/${id}`; 
    };

    // Fungsi Force Logout
    const forceLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token'); 
        window.location.href = '/login'; 
    };

    const handleUpdateIdentity = async (e) => {
        e.preventDefault();
        setIdentityError('');

        const endpoint = getEndpoint(userData.role, userData.id);

        try {
            const response = await API.put(endpoint, {
                ...userData,
                name: identityData.name,
                email: identityData.email
            });
            const updated = { ...userData, name: identityData.name, email: identityData.email };
            localStorage.setItem('user', JSON.stringify(updated));
            onUpdateUser(updated);
            setToast({ show: true, message: 'Identitas profil berhasil diperbarui!' });
        } catch (err) {
            setIdentityError(err.response?.data?.message || 'Gagal memperbarui identitas profil.');
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (passwordData.currentPassword === passwordData.newPassword) {
            setPasswordError('Password baru tidak boleh sama dengan password saat ini!');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Konfirmasi password baru tidak cocok!');
            return;
        }

        const baseEndpoint = getEndpoint(userData.role, userData.id);
        const passwordEndpoint = `${baseEndpoint}/password`;

        try {
            await API.put(passwordEndpoint, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            setLogoutMessage({
                title: 'Password Diubah!',
                desc: 'Untuk alasan keamanan, sesi Anda saat ini diakhiri. Silakan login kembali menggunakan password baru Anda.'
            });
            setShowLogoutModal(true);

        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Password saat ini salah.');
        }
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setEmailError('');

        const endpoint = getEndpoint(userData.role, userData.id);

        try {
            await API.put(endpoint, {
                ...userData,
                email: emailData.newEmail
            });
            
            setLogoutMessage({
                title: 'Email Diubah!',
                desc: 'Untuk alasan keamanan, sesi Anda saat ini diakhiri. Silakan login kembali menggunakan email baru Anda.'
            });
            setShowLogoutModal(true);

        } catch (err) {
            setEmailError(err.response?.data?.message || 'Gagal memperbarui email.');
        }
    };

    const formatRole = (role) => {
        if (role === 'admin') return 'Administrator';
        if (role === 'atasan' || role === 'marcom_manager') return 'Atasan / Manager';
        return 'Staff/Anggota';
    };

    return (
        <div className="w-full max-w-4xl text-left relative">
            
            {/* Modal Logout */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[30px] p-8 max-w-sm w-full mx-4 shadow-2xl text-center transform transition-all">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-extrabold text-[#0d2757] mb-3">{logoutMessage.title}</h3>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed px-2">
                            {logoutMessage.desc}
                        </p>
                        <button
                            onClick={forceLogout}
                            className="w-full bg-[#0d2757] hover:bg-[#0a1e45] text-white font-bold py-3.5 rounded-xl transition-colors"
                        >
                            OK, Login Ulang
                        </button>
                    </div>
                </div>
            )}

            <div className="flex space-x-3 mb-6 bg-gray-200/50 p-1.5 rounded-xl w-fit">
                <button
                    type="button"
                    onClick={() => setSubTab('identitas')}
                    className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${
                        subTab === 'identitas' ? 'bg-white text-[#e95723] shadow-sm' : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    Identitas
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('keamanan')}
                    className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${
                        subTab === 'keamanan' ? 'bg-white text-[#e95723] shadow-sm' : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    Keamanan Akun
                </button>
            </div>

            {subTab === 'identitas' && (
                <div className="bg-white rounded-3xl border border-gray-200/60 p-10 max-w-2xl shadow-sm text-left">
                    <div className="flex justify-center w-full mb-6">
                        <div className="w-16 h-16 bg-orange-50 text-[#e95723] rounded-full flex items-center justify-center font-bold text-xl border border-orange-100">
                            {identityData.name?.charAt(0)}
                        </div>
                    </div>

                    {identityError && <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs rounded-xl">{identityError}</div>}
                    
                    <form onSubmit={handleUpdateIdentity} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Nama Lengkap *</label>
                            <input 
                                type="text" 
                                required
                                value={identityData.name} 
                                onChange={(e) => setIdentityData({ ...identityData, name: e.target.value })}
                                className="w-full bg-white px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Email *</label>
                            <input 
                                type="email" 
                                required
                                value={identityData.email} 
                                onChange={(e) => setIdentityData({ ...identityData, email: e.target.value })}
                                className="w-full bg-white px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 block mb-1">Role</label>
                            <input type="text" disabled value={formatRole(userData.role)} className="w-full bg-slate-50 px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm text-gray-400 cursor-not-allowed focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 block mb-1">Divisi</label>
                            <input type="text" disabled value={userData.divisi || '-'} className="w-full bg-slate-50 px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm text-gray-400 cursor-not-allowed focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 block mb-1">Jabatan</label>
                            <input type="text" disabled value={userData.jabatan || '-'} className="w-full bg-slate-50 px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm text-gray-400 cursor-not-allowed focus:outline-none" />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-[#e95723] hover:bg-[#d44b1c] text-white font-bold text-sm py-2.5 rounded-xl transition mt-6 shadow-md shadow-orange-600/10"
                        >
                            Simpan Perubahan Profil
                        </button>
                    </form>
                </div>
            )}

            {subTab === 'keamanan' && (
                <div className="space-y-6 max-w-2xl text-left">
                    <div className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-sm">
                        <h4 className="font-bold text-[#0d2757] mb-4 text-md">Ganti Password</h4>
                        {passwordError && <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs rounded-xl">{passwordError}</div>}
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            
                            <PasswordInput 
                                label="Password Lama"
                                placeholder="........"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                showPassword={showCurrentPassword}
                                setShowPassword={setShowCurrentPassword}
                            />
                            
                            <PasswordInput 
                                label="Password Baru"
                                placeholder="Masukkan password baru"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                showPassword={showNewPassword}
                                setShowPassword={setShowNewPassword}
                            />

                            <PasswordInput 
                                label="Konfirmasi Password Baru"
                                placeholder="Ulangi password baru"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                showPassword={showConfirmPassword}
                                setShowPassword={setShowConfirmPassword}
                            />

                            <button type="submit" className="w-full bg-[#004fa6] hover:bg-[#003d82] text-white font-bold text-sm py-2.5 rounded-xl transition mt-2">Simpan Password</button>
                        </form>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-sm">
                        <h4 className="font-bold text-[#0d2757] mb-4 text-md">Ganti Email</h4>
                        {emailError && <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs rounded-xl">{emailError}</div>}
                        <form onSubmit={handleUpdateEmail} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Email Saat Ini</label>
                                <input type="email" disabled value={emailData.currentEmail} className="w-full bg-slate-50 px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm text-gray-400 cursor-not-allowed focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Email Baru</label>
                                <input type="email" required placeholder="Masukkan email baru" value={emailData.newEmail} onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700" />
                            </div>
                            
                            <PasswordInput 
                                label="Password Konfirmasi"
                                placeholder="Masukkan password konfirmasi"
                                value={emailData.confirmPassword}
                                onChange={(e) => setEmailData({...emailData, confirmPassword: e.target.value})}
                                showPassword={showEmailConfirmPassword}
                                setShowPassword={setShowEmailConfirmPassword}
                            />

                            <button type="submit" className="w-full bg-[#004fa6] hover:bg-[#003d82] text-white font-bold text-sm py-2.5 rounded-xl transition mt-2">Simpan Email</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilUser;