import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const ProfilUser = ({ userData, onUpdateUser, setToast }) => {
    const [subTab, setSubTab] = useState('identitas'); // 'identitas' atau 'keamanan'
    
    // State Form Identitas (Bisa Diubah oleh Admin)
    const [identityData, setIdentityData] = useState({ name: '', email: '' });
    const [identityError, setIdentityError] = useState('');

    // State Form Keamanan Akun
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [emailData, setEmailData] = useState({ currentEmail: '', newEmail: '', confirmPassword: '' });
    
    const [passwordError, setPasswordError] = useState('');
    const [emailError, setEmailError] = useState('');

    // Set data awal saat komponen dipanggil
    useEffect(() => {
        if (userData) {
            setIdentityData({ name: userData.name || '', email: userData.email || '' });
            setEmailData(prev => ({ ...prev, currentEmail: userData.email }));
        }
    }, [userData]);

    // Handler Update Identitas Diri
    const handleUpdateIdentity = async (e) => {
        e.preventDefault();
        setIdentityError('');

        try {
            const response = await API.put(`/admin/users/${userData.id}`, {
                ...userData,
                name: identityData.name,
                email: identityData.email
            });
            
            // Simpan perubahan ke localStorage & kirim ke parent state
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

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Konfirmasi password baru tidak cocok!');
            return;
        }

        try {
            await API.put(`/admin/users/${userData.id}/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setToast({ show: true, message: 'Password berhasil diperbarui!' });
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Password saat ini salah.');
        }
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setEmailError('');

        try {
            await API.put(`/admin/users/${userData.id}`, {
                ...userData,
                email: emailData.newEmail
            });
            const updated = { ...userData, email: emailData.newEmail };
            localStorage.setItem('user', JSON.stringify(updated));
            onUpdateUser(updated);
            setEmailData({ currentEmail: emailData.newEmail, newEmail: '', confirmPassword: '' });
            setToast({ show: true, message: 'Email berhasil diperbarui!' });
        } catch (err) {
            setEmailError(err.response?.data?.message || 'Gagal memperbarui email.');
        }
    };

    const formatRole = (role) => {
        if (role === 'admin') return 'Administrator';
        if (role === 'marcom_manager') return 'Atasan / Manager';
        return 'Anggota MarCom';
    };

    return (
        <div className="w-full max-w-4xl text-left">
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
                            <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Password Lama</label>
                                <input type="password" required placeholder="........" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Password Baru</label>
                                <input type="password" required placeholder="Masukkan password baru" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Konfirmasi Password Baru</label>
                                <input type="password" required placeholder="Ulangi password baru" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700" />
                            </div>
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
                            <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Password Konfirmasi</label>
                                <input type="password" required placeholder="Masukkan password konfirmasi" value={emailData.confirmPassword} onChange={(e) => setEmailData({...emailData, confirmPassword: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700" />
                            </div>
                            <button type="submit" className="w-full bg-[#004fa6] hover:bg-[#003d82] text-white font-bold text-sm py-2.5 rounded-xl transition mt-2">Simpan Email</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilUser;