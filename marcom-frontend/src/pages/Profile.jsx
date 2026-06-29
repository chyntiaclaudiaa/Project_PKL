import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import '../style/MemberDashboard.css'; // tetap dipakai untuk member-layout & member-main
import Sidebar from '../components/Sidebar';

// ─── Komponen reusable password input dengan eye toggle ───────────────────────
const PasswordInput = ({ label, value, onChange, showPassword, setShowPassword, placeholder }) => (
  <div>
    <label className="text-xs font-bold text-slate-600 block mb-1">{label}</label>
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        required
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 pr-12 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
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

// ─── Main Component ───────────────────────────────────────────────────────────
function Profile() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('identity');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    divisi: '',
    jabatan: '',
    status: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
  });

  const [loading, setLoading]               = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingEmail, setSavingEmail]       = useState(false);
  const [passwordError, setPasswordError]   = useState('');
  const [emailError, setEmailError]         = useState('');

  // Eye-icon states
  const [showCurrentPw, setShowCurrentPw]   = useState(false);
  const [showNewPw, setShowNewPw]           = useState(false);
  const [showConfirmPw, setShowConfirmPw]   = useState(false);
  const [showEmailPw, setShowEmailPw]       = useState(false);

  // Modal setelah ganti password / email
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutMessage, setLogoutMessage]     = useState({ title: '', desc: '' });

  useEffect(() => {
    getProfile();
  }, []);

  // ── API calls ──────────────────────────────────────────────────────────────
  const getProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get('/profile');
      setProfile(response.data);

      const oldUser = JSON.parse(localStorage.getItem('user')) || {};
      localStorage.setItem('user', JSON.stringify({ ...oldUser, ...response.data }));
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengambil data profil.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password baru minimal 8 karakter.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak sama.');
      return;
    }

    try {
      setSavingPassword(true);
      await API.put('/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setLogoutMessage({
        title: 'Password Diubah!',
        desc: 'Untuk alasan keamanan, sesi Anda saat ini diakhiri. Silakan login kembali menggunakan password baru Anda.',
      });
      setShowLogoutModal(true);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Gagal memperbarui password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailError('');

    try {
      setSavingEmail(true);
      await API.put('/profile/email', {
        newEmail: emailForm.newEmail,
        password: emailForm.password,
      });
      setEmailForm({ newEmail: '', password: '' });
      setLogoutMessage({
        title: 'Email Diubah!',
        desc: 'Untuk alasan keamanan, sesi Anda saat ini diakhiri. Silakan login kembali menggunakan email baru Anda.',
      });
      setShowLogoutModal(true);
    } catch (error) {
      setEmailError(error.response?.data?.message || 'Gagal memperbarui email.');
    } finally {
      setSavingEmail(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const forceLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    if (role === 'admin')              return 'Admin Sistem';
    if (role === 'marcom_member')      return 'Anggota MarCom';
    if (role === 'marcom_supervisor')  return 'Atasan MarCom';
    return role || '-';
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="member-layout">
      <Sidebar user={profile} active="profile" onLogout={handleLogout} />

      <main className="member-main">

        {/* Header */}
        <header className="px-8 pt-8 pb-4">
          <h1 className="text-2xl font-extrabold text-[#0d2757]">Profil Saya</h1>
        </header>

        {/* Modal logout setelah ganti password/email */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[30px] p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-[#0d2757] mb-3">{logoutMessage.title}</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed px-2">{logoutMessage.desc}</p>
              <button
                onClick={forceLogout}
                className="w-full bg-[#0d2757] hover:bg-[#0a1e45] text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                OK, Login Ulang
              </button>
            </div>
          </div>
        )}

        <section className="px-8 pb-8">

          {/* Tab Switcher */}
          <div className="flex space-x-3 mb-6 bg-gray-200/50 p-1.5 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('identity')}
              className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'identity'
                  ? 'bg-white text-[#e95723] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Identitas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'security'
                  ? 'bg-white text-[#e95723] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Keamanan Akun
            </button>
          </div>

          {/* ── Tab: Identitas (read-only) ─────────────────────────────────── */}
          {activeTab === 'identity' && (
            <div className="bg-white rounded-3xl border border-gray-200/60 p-10 max-w-2xl shadow-sm">
              {loading ? (
                <p className="text-center text-gray-400 text-sm py-6">Memuat profil...</p>
              ) : (
                <>
                  {/* Avatar */}
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-orange-50 text-[#e95723] rounded-full flex items-center justify-center font-bold text-xl border border-orange-100">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Nama Lengkap', value: profile.name },
                      { label: 'Email',         value: profile.email },
                      { label: 'Role',          value: getRoleLabel(profile.role) },
                      { label: 'Divisi',        value: profile.divisi },
                      { label: 'Jabatan',       value: profile.jabatan },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label className="text-xs font-bold text-slate-400 block mb-1">{label}</label>
                        <input
                          type="text"
                          disabled
                          value={value || '-'}
                          className="w-full bg-slate-50 px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm text-gray-400 cursor-not-allowed focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 text-xs text-slate-400 text-center">
                    Nama, role, divisi, dan jabatan dikelola oleh Admin Sistem.
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── Tab: Keamanan Akun ─────────────────────────────────────────── */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">

              {/* Ganti Password */}
              <div className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-sm">
                <h4 className="font-bold text-[#0d2757] mb-4">Ganti Password</h4>
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs rounded-xl">{passwordError}</div>
                )}
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <PasswordInput
                    label="Password Lama"
                    placeholder="........"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    showPassword={showCurrentPw}
                    setShowPassword={setShowCurrentPw}
                  />
                  <PasswordInput
                    label="Password Baru"
                    placeholder="Masukkan password baru"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    showPassword={showNewPw}
                    setShowPassword={setShowNewPw}
                  />
                  <PasswordInput
                    label="Konfirmasi Password Baru"
                    placeholder="Ulangi password baru"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    showPassword={showConfirmPw}
                    setShowPassword={setShowConfirmPw}
                  />
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="w-full bg-[#004fa6] hover:bg-[#003d82] disabled:opacity-60 text-white font-bold text-sm py-2.5 rounded-xl transition mt-2"
                  >
                    {savingPassword ? 'Menyimpan...' : 'Simpan Password'}
                  </button>
                </form>
              </div>

              {/* Ganti Email */}
              <div className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-sm">
                <h4 className="font-bold text-[#0d2757] mb-4">Ganti Email</h4>
                {emailError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs rounded-xl">{emailError}</div>
                )}
                <form onSubmit={handleChangeEmail} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Email Saat Ini</label>
                    <input
                      type="email"
                      disabled
                      value={profile.email || ''}
                      className="w-full bg-slate-50 px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm text-gray-400 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Email Baru</label>
                    <input
                      type="email"
                      required
                      placeholder="Masukkan email baru"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                    />
                  </div>
                  <PasswordInput
                    label="Password Konfirmasi"
                    placeholder="Masukkan password untuk konfirmasi"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                    showPassword={showEmailPw}
                    setShowPassword={setShowEmailPw}
                  />
                  <button
                    type="submit"
                    disabled={savingEmail}
                    className="w-full bg-[#004fa6] hover:bg-[#003d82] disabled:opacity-60 text-white font-bold text-sm py-2.5 rounded-xl transition mt-2"
                  >
                    {savingEmail ? 'Menyimpan...' : 'Simpan Email'}
                  </button>
                </form>
              </div>

            </div>
          )}
        </section>
      </main>

      <button className="help-btn">?</button>
    </div>
  );
}

export default Profile;