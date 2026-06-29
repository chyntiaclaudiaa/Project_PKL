import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import '../style/MemberDashboard.css';
import '../style/Profile.css';
import Sidebar from '../components/Sidebar';

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

  const [loading, setLoading] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);

      const response = await API.get('/profile');
      setProfile(response.data);

      const oldUser = JSON.parse(localStorage.getItem('user')) || {};
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...oldUser,
          ...response.data,
        })
      );
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;

    setEmailForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('Semua field password wajib diisi.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert('Password baru minimal 8 karakter.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Konfirmasi password baru tidak sama.');
      return;
    }

    try {
      setSavingPassword(true);

      const response = await API.put('/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      alert(response.data.message || 'Password berhasil diperbarui.');

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memperbarui password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();

    if (!emailForm.newEmail || !emailForm.password) {
      alert('Email baru dan password konfirmasi wajib diisi.');
      return;
    }

    try {
      setSavingEmail(true);

      const response = await API.put('/profile/email', {
        newEmail: emailForm.newEmail,
        password: emailForm.password,
      });

      alert(response.data.message || 'Email berhasil diperbarui.');

      setProfile(response.data.user);

      const oldUser = JSON.parse(localStorage.getItem('user')) || {};
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...oldUser,
          ...response.data.user,
        })
      );

      setEmailForm({
        newEmail: '',
        password: '',
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memperbarui email.');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'Admin Sistem';
    if (role === 'marcom_member') return 'Anggota MarCom';
    if (role === 'marcom_supervisor') return 'Atasan MarCom';
    return role || '-';
  };

  return (
    <div className="member-layout">
    <Sidebar user={profile} active="profile" onLogout={handleLogout} />

      <main className="member-main">
        <header className="profile-header">
          <h1>Profil Saya</h1>
        </header>

        <section className="profile-content">
          <div className="profile-tabs profile-tabs-two">
            <button
              className={activeTab === 'identity' ? 'profile-tab active' : 'profile-tab'}
              onClick={() => setActiveTab('identity')}
            >
              Identitas
            </button>

            <button
              className={activeTab === 'security' ? 'profile-tab active' : 'profile-tab'}
              onClick={() => setActiveTab('security')}
            >
              Keamanan Akun
            </button>
          </div>

          {activeTab === 'identity' && (
            <div className="profile-card">
              {loading ? (
                <p className="profile-loading">Memuat profil...</p>
              ) : (
                <>
                  <div className="profile-avatar-large">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'C'}
                  </div>

                  <div className="profile-readonly-group">
                    <label>Nama Lengkap</label>
                    <div className="readonly-box">{profile.name || '-'}</div>
                  </div>

                  <div className="profile-readonly-group">
                    <label>Email</label>
                    <div className="readonly-box">{profile.email || '-'}</div>
                  </div>

                  <div className="profile-readonly-group">
                    <label>Role</label>
                    <div className="readonly-box">{getRoleLabel(profile.role)}</div>
                  </div>

                  <div className="profile-readonly-group">
                    <label>Divisi</label>
                    <div className="readonly-box">{profile.divisi || '-'}</div>
                  </div>

                  <div className="profile-readonly-group">
                    <label>Jabatan</label>
                    <div className="readonly-box">{profile.jabatan || '-'}</div>
                  </div>

                  <div className="profile-note">
                    Nama, role, divisi, dan jabatan dikelola oleh Admin Sistem.
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="security-wrapper">
              <form className="profile-card security-card" onSubmit={handleResetPassword}>
                <h2>Ganti Password</h2>

                <div className="profile-form-group">
                  <label>Password Lama</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="profile-form-group">
                  <label>Password Baru</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="profile-form-group">
                  <label>Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <button type="submit" className="profile-save-btn blue" disabled={savingPassword}>
                  {savingPassword ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </form>

              <form className="profile-card security-card" onSubmit={handleChangeEmail}>
                <h2>Ganti Email</h2>

                <div className="profile-form-group">
                  <label>Email Saat Ini</label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    disabled
                  />
                </div>

                <div className="profile-form-group">
                  <label>Email Baru</label>
                  <input
                    type="email"
                    name="newEmail"
                    value={emailForm.newEmail}
                    onChange={handleEmailChange}
                  />
                </div>

                <div className="profile-form-group">
                  <label>Password Konfirmasi</label>
                  <input
                    type="password"
                    name="password"
                    value={emailForm.password}
                    onChange={handleEmailChange}
                  />
                </div>

                <button type="submit" className="profile-save-btn blue" disabled={savingEmail}>
                  {savingEmail ? 'Menyimpan...' : 'Simpan Email'}
                </button>
              </form>
            </div>
          )}
        </section>
      </main>

      <button className="help-btn">?</button>
    </div>
  );
}

export default Profile;