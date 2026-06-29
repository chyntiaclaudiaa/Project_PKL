import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import logoBankSumut from '../assets/logo_banksumut.png'; 

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false); // State untuk checkbox Ingat Saya
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // 1. CEK SESI AKTIF & EMAIL YANG TERSIMPAN (Saat Halaman Dimuat)
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        // Supaya gaperlu login masuk-masuk lagi kalau aplikasinya dibuka ulang
        if (token && savedUser) {
            const user = JSON.parse(savedUser);
            if (user.role === "admin") navigate("/admin/dashboard");
            else if (user.role === "marcom_manager") navigate("/atasan/dashboard");
            else navigate("/anggota/dashboard");
            return;
        }

        // Ambil email lama jika user pernah mencentang "Ingat saya"
        const savedEmail = localStorage.getItem('remembered_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Email dan password wajib diisi.');
            return;
        }

        try {
            setLoading(true);

            const response = await API.post('/auth/login', {
                email,
                password,
            });

            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            if (rememberMe) {
                localStorage.setItem('remembered_email', email);
            } else {
                localStorage.removeItem('remembered_email');
            }

            if (user.must_change_password) {
                navigate('/change-password');
                return;
            }

            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'marcom_member') {
                navigate('/anggota/dashboard');
            } else if (user.role === 'marcom_manager') { 
                navigate('/atasan/dashboard');
            } else {
                setError('Role pengguna tidak dikenali.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan saat login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-gradient-to-b from-[#0B3C80] to-[#05224F] text-white font-sans overflow-hidden select-none">
            
            <div className="hidden md:flex flex-col justify-between w-1/2 p-16 bg-transparent">
                <div>
                    <div className="flex items-left mb-16">
                        <img 
                            src={logoBankSumut} 
                            alt="Bank SUMUT" 
                            className="h-16 md:h-20 w-auto object-contain" 
                        />
                    </div>

                    {/* Main Content Info */}
                    <div className="max-w-xl">
                        <h2 className="text-4xl font-bold leading-tight mb-4">
                            Satu platform untuk semua <br />
                            <span className="text-[#e95723]">request konten</span>
                        </h2>
                        
                        <p className="text-sm text-gray-300 leading-relaxed max-w-md mb-8">
                            Platform terpusat untuk manajemen request konten tim Marketing Communication. 
                            Pantai progres, kelola deadline, dan koordinasi tim dalam satu sistem.
                        </p>

                        {/* Fitur List Buttons */}
                        <div className="flex flex-col space-y-3 w-48">
                            <div className="flex items-center space-x-3 border border-gray-400/30 rounded-full px-4 py-2 bg-transparent text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#e95723]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h2.25A1.125 1.125 0 0 1 7.5 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z" />
                                </svg>
                                <span>Pantau progres</span>
                            </div>
                            <div className="flex items-center space-x-3 border border-gray-400/30 rounded-full px-4 py-2 bg-transparent text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#e95723]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                </svg>
                                <span>Kelola Deadline</span>
                            </div>
                            <div className="flex items-center space-x-3 border border-gray-400/30 rounded-full px-4 py-2 bg-transparent text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#e95723]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                                </svg>
                                <span>Koordinasi Tim</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-400">
                    © 2026 Marketing Communication Department
                </p>
            </div>

            <div className="flex items-center justify-center w-full md:w-1/2 bg-transparent p-6 md:p-12">
                <div className="bg-white text-gray-800 rounded-3xl shadow-2xl p-12 w-full max-w-lg min-h-[520px] flex flex-col justify-center">
                    <h3 className="text-3xl font-bold text-[#0B3C80]">Selamat Datang</h3>
                    <p className="text-sm text-gray-400 mt-1 mb-6">Masuk ke akun Anda untuk melanjutkan</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>
                                </span>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@marcom.com" 
                                    className="w-full pl-12 pr-4 py-3 bg-[#ebf2fa] text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border-none transition-all placeholder-gray-400"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                    </svg>
                                </span>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••" 
                                    className="w-full pl-12 pr-12 py-3 bg-[#ebf2fa] text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border-none transition-all placeholder-gray-400"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822 3 3m-3-3-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center pt-1 mb-4">
                        <label className="flex items-center space-x-2 text-xs font-semibold text-gray-500 cursor-pointer select-none">
                            <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 accent-[#0B3C80]"
                            />
                            <span>Ingat saya</span>
                        </label>
                        </div>

                        <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#e95723] hover:bg-[#d44b1c] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition duration-200 mt-2 shadow-md shadow-orange-600/20 text-center"
                        >
                        {loading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;