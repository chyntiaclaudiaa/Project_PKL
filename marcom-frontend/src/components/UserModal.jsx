import React, { useState, useEffect, useRef } from 'react';

const UserModal = ({ 
    isOpen, 
    isEdit, 
    onClose, 
    formData, 
    setFormData, 
    onSubmit, 
    errorMsg 
}) => {
    // State lokal khusus untuk Modal Form
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [isDivisiDropdownOpen, setIsDivisiDropdownOpen] = useState(false);
    const [divisiSearch, setDivisiSearch] = useState('');
    const dropdownRef = useRef(null);

    const divisiOptions = [
        'Divisi Audit Internal', 'Divisi Human Capital', 'Divisi Kepatuhan', 'Divisi Manajemen Risiko',
        'Divisi Operasional', 'Divisi Umum', 'Divisi Keuangan', 'Divisi Teknologi Informasi',
        'Divisi Tresuri', 'Divisi Funding & Wealth Management', 'Divisi SME & Commercial',
        'Unit Usaha Syariah', 'UKK APU & PPT', 'Divisi Penyelamatan Kredit', 'Divisi Perencanaan Strategis',
        'Unit Strategi Anti Fraud', 'Digital Banking', 'Corporate Culture & Service',
        'Divisi Kredit Konsumer', 'Divisi Credit Risk', 'UKK Commercial Business Center',
        'Divisi Marketing Communication', 'UKK Internal Control Over Financial Report', 'Unit Kantor', 'Eksternal/lain-lain'
    ];

    const filteredDivisi = divisiOptions.filter(d => d.toLowerCase().includes(divisiSearch.toLowerCase()));

    // Handler klik di luar dropdown divisi
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDivisiDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handler perubahan jabatan
    const handleJabatanChange = (selectedJabatan) => {
        setFormData({
            ...formData,
            jabatan: selectedJabatan
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-visible border border-slate-100">
                <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-slate-50/50 rounded-t-3xl">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{!isEdit ? 'Tambah Pengguna' : 'Edit Pengguna'}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{!isEdit ? 'Buat akun pengguna baru sistem' : `Edit data: ${formData.name}`}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-gray-600 text-sm font-bold">✕ Batal</button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-4 text-gray-800 relative">
                    {errorMsg && <div className="p-3 bg-red-100 text-red-700 text-xs rounded-xl font-bold">{errorMsg}</div>}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Nama Lengkap *</label>
                            <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700" placeholder="Contoh: Chairun Nisaq" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Email *</label>
                            <input type="email" required value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700" placeholder="nama@marcom.com" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">{!isEdit ? 'Password Sementara *' : 'Ganti Password (Kosongkan jika tidak diubah)'}</label>
                            <div className="relative">
                                <input 
                                    type={showModalPassword ? 'text' : 'password'}
                                    required={!isEdit} value={formData.password || ''} 
                                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                    className="w-full bg-white pl-3 pr-10 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden" placeholder="••••••••" 
                                />
                                <button type="button" onClick={() => setShowModalPassword(!showModalPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    {showModalPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822 3 3m-3-3-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Jabatan *</label>
                            <select value={formData.jabatan || ''} onChange={(e) => handleJabatanChange(e.target.value)} className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700" required>
                                <option value="" disabled hidden>Pilih Jabatan...</option>
                                <option value="Staff/Anggota">Staff/Anggota</option>
                                <option value="Pemimpin Divisi">Pemimpin Divisi</option>
                                <option value="PJ. Pemimpin Divisi">PJ. Pemimpin Divisi</option>
                                <option value="Pemimpin Unit">Pemimpin Unit</option>
                                <option value="PJ. Pemimpin Unit">PJ. Pemimpin Unit</option>
                                <option value="Pemimpin Unit Kerja Khusus (UKK)">Pemimpin Unit Kerja Khusus (UKK)</option>
                                <option value="PJ. Pemimpin Unit Kerja Khusus (UKK)">PJ. Pemimpin Unit Kerja Khusus (UKK)</option>
                                <option value="Project Leader">Project Leader</option>
                                <option value="Unit Kantor">Unit Kantor</option>
                                <option value="Eksternal/Lain-lain">Eksternal/Lain-lain</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative" ref={dropdownRef}>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Divisi / Unit *</label>
                            <div 
                                onClick={() => setIsDivisiDropdownOpen(!isDivisiDropdownOpen)}
                                className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-xs flex justify-between items-center cursor-pointer focus:outline-none text-gray-700 hover:border-blue-400 transition-colors"
                            >
                                <span className="truncate pr-2">{formData.divisi || 'Pilih Divisi...'}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400 flex-shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            </div>

                            {isDivisiDropdownOpen && (
                                <div className="absolute z-[999] w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto animate-fadeIn">
                                    <div className="p-2 sticky top-0 bg-white border-b border-gray-100 z-10">
                                        <div className="relative">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
                                            </svg>
                                            <input
                                                type="text"
                                                placeholder="Cari divisi..."
                                                value={divisiSearch}
                                                onChange={(e) => setDivisiSearch(e.target.value)}
                                                className="w-full bg-slate-50 pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 font-medium"
                                                onClick={(e) => e.stopPropagation()} 
                                            />
                                        </div>
                                    </div>
                                    <ul className="py-1">
                                        {filteredDivisi.map((opt) => (
                                            <li
                                                key={opt}
                                                onClick={() => {
                                                    setFormData({ ...formData, divisi: opt });
                                                    setIsDivisiDropdownOpen(false);
                                                    setDivisiSearch('');
                                                }}
                                                className={`px-3 py-2 text-xs cursor-pointer transition-colors ${formData.divisi === opt ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}
                                            >
                                                {opt}
                                            </li>
                                        ))}
                                        {filteredDivisi.length === 0 && (
                                            <li className="px-3 py-3 text-xs text-gray-400 text-center font-medium">Pencarian tidak ditemukan</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Status Akun *</label>
                            <select value={formData.status || 'Aktif'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-white px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
                                <option value="Aktif">Aktif</option>
                                <option value="Nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex justify-end space-x-2 mt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold border border-gray-200 text-gray-500 hover:bg-slate-50 rounded-xl transition">Batal</button>
                        <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-[#e95723] hover:bg-[#d44b1c] rounded-xl shadow-md transition">
                            {!isEdit ? 'Simpan Pengguna' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;