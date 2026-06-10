import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State untuk show/hide password
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await API.post('/auth/login', { email, password });
            const { token, user } = response.data;

            // Simpan token dan data user ke Local Storage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Arahkan halaman berdasarkan role pengguna
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard'); 
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan saat login.');
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#0a3674] text-white font-sans overflow-hidden">
            {/* SISI KIRI: Informasi & Branding Sistem */}
            <div className="hidden md:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-b from-[#0b3d82] to-[#05214d]">
                <div>
                    {/* Brand Header: COMET */}
                    <div className="flex items-center space-x-3">
                        <div className="bg-[#e95723] text-white font-bold p-2 rounded-lg text-xl w-10 h-10 flex items-center justify-center">C</div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight tracking-wide">COMET</h1>
                            <p className="text-xs text-gray-300">Content Marcom Engagement & Tracking System</p>
                        </div>
                    </div>

                    <div className="mt-24 max-w-lg">
                        <h2 className="text-4xl font-bold leading-tight mb-6">Kelola Request Konten dengan Mudah & Efisien</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Platform terpusat untuk manajemen request konten tim Marketing Communication. 
                            Pantau progres, kelola deadline, dan koordinasi tim dalam satu sistem.
                        </p>
                    </div>
                </div>

                <p className="text-xs text-gray-400">© 2026 Marketing Communication Department</p>
            </div>

            {/* SISI KANAN: Kotak Input Login */}
            <div className="flex items-center justify-center w-full md:w-1/2 bg-[#0d4791] p-6 md:p-12">
                <div className="bg-white text-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
                    <h3 className="text-2xl font-bold text-gray-900">Selamat Datang</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-6">Masuk ke akun Anda untuk melanjutkan</p>

                    {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">{error}</div>}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@marcom.com" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••" 
                                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    required
                                />
                                {/* Tombol Toggle Mata (Show/Hide) */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        // Ikon Mata Terbuka (Hide Password)
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    ) : (
                                        // Ikon Mata Tertutup / Dicoret (Show Password)
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822 3 3m-3-3-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="text-right">
                            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">Lupa password?</a>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-[#e95723] hover:bg-[#d44b1c] text-white font-bold py-2.5 rounded-lg transition duration-200"
                        >
                            Masuk &gt;
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;