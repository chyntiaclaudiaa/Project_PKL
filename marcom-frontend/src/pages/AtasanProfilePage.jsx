import { useEffect, useState } from "react";
import AtasanSidebar from "../components/atasan/AtasanSidebar";
import {
  getProfile,
  changePassword,
  changeEmail,
} from "../services/atasan_profileService";

export default function AtasanProfilePage() {
  // Menggunakan localStorage agar state tab tetap tersimpan saat pindah halaman
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("profileActiveTab") || "identity";
  });
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk kontrol Toast Notification
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    password: "",
  });

  // Simpan state tab ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem("profileActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    setEmailForm({ newEmail: "", password: "" });
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    loadProfile();
  }, []);

  const showNotification = (message, type = "success") => {
    toast.show && setToast({ show: false, message: "", type: "success" }); // Reset prevent glitch
    setTimeout(() => {
      setToast({ show: true, message, type });
    }, 50);
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await changePassword(passwordForm);
      showNotification("Password berhasil diubah!", "success");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const errMsg = err.response?.data?.message || "Gagal mengubah password";
      showNotification(errMsg, "error");
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    try {
      await changeEmail(emailForm);
      showNotification("Email berhasil diubah!", "success");
      setEmailForm({ newEmail: "", password: "" });
      loadProfile();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Gagal mengubah email";
      showNotification(errMsg, "error");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F8FB] relative font-sans text-slate-700">
      
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 transition-all duration-300">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-md border text-sm font-medium text-white ${
              toast.type === "success"
                ? "bg-[#1D9E75] border-[#1D9E75]" 
                : "bg-[#E7000B] border-[#E7000B]" 
            }`}
          >
            {toast.type === "success" ? (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar tetap mengunci h-screen */}
      <div className="sticky top-0 h-screen z-20">
        <AtasanSidebar activeMenu="profile" />
      </div>

      {/* CONTAINER KANAN: Scrollbar disematkan di sini agar memanjang melewati header */}
      <div className="flex-1 h-screen flex flex-col overflow-y-auto bg-[#F6F8FB]">
        
        {/* HEADER MINI (FIXED / POSITION STICKY) */}
        <header className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex flex-col justify-center shrink-0 z-10">
          <h1 className="text-base font-bold text-[#0D1B3E] leading-tight">Profile Saya</h1>
        </header>

        {/* MAIN CONTAINER (Isi Form dan Konten Utama) */}
        <main className="p-6 md:p-8 max-w-md flex-1">
          
          {/* TAB BUTTONS (Terbagi 2 sama panjang memenuhi lebar card) */}
          <div className="flex w-full gap-2 mb-6">
            <button
              onClick={() => setActiveTab("identity")}
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold border border-slate-200 transition-all ${
                activeTab === "identity"
                  ? "bg-white text-[#E3791C] shadow-sm"
                  : "bg-[#EAEFF5] text-slate-500 border-transparent hover:bg-slate-200"
              }`}
            >
              Identitas
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold border border-slate-200 transition-all ${
                activeTab === "security"
                  ? "bg-white text-[#E3791C] shadow-sm"
                  : "bg-[#EAEFF5] text-slate-500 border-transparent hover:bg-slate-200"
              }`}
            >
              Keamanan Akun
            </button>
          </div>

          {/* KONTEN UTAMA */}
          {isLoading ? (
            <div className="text-center py-10 text-slate-400 text-sm">Memuat data profil...</div>
          ) : !profile ? (
            <div className="text-center py-10 text-rose-500 text-sm">Gagal memuat profil.</div>
          ) : (
            <>
              {/* TAB CONTENT: IDENTITAS */}
              {activeTab === "identity" && (
                <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-none w-full">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-2xl font-bold text-[#E3791C]">
                      {profile.name?.charAt(0)}
                    </div>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
                      <input
                        type="text"
                        disabled
                        value={profile.name || ""}
                        className="w-full bg-[#EAEFF5] border border-slate-200 rounded-lg px-4 py-2.5 text-slate-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Email</label>
                      <input
                        type="text"
                        disabled
                        value={profile.email || ""}
                        className="w-full bg-[#EAEFF5] border border-slate-200 rounded-lg px-4 py-2.5 text-slate-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Role</label>
                      <input
                        type="text"
                        disabled
                        value={profile.role || ""}
                        className="w-full bg-[#EAEFF5] border border-slate-200 rounded-lg px-4 py-2.5 text-slate-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Divisi</label>
                      <input
                        type="text"
                        disabled
                        value={profile.divisi || "-"}
                        className="w-full bg-[#EAEFF5] border border-slate-200 rounded-lg px-4 py-2.5 text-slate-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Jabatan</label>
                      <input
                        type="text"
                        disabled
                        value={profile.jabatan || "-"}
                        className="w-full bg-[#EAEFF5] border border-slate-200 rounded-lg px-4 py-2.5 text-slate-600 outline-none"
                      />
                    </div>

                    <div className="mt-5 bg-orange-50 border border-orange-200 text-[#E3791C] text-xs font-semibold rounded-lg p-3 text-center">
                      Nama, role, divisi, dan jabatan dikelola oleh Admin Sistem.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: KEAMANAN */}
              {activeTab === "security" && (
                <div className="space-y-6 w-full">
                  {/* Form Ganti Password */}
                  <form onSubmit={handlePasswordChange} className="bg-white border border-slate-300 rounded-xl p-6 shadow-none">
                    <h2 className="text-base font-bold text-[#0D1B3E] mb-4">Ganti Password</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Lama</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#034EA2]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Baru</label>
                        <input
                          type="password"
                          placeholder="Masukkan password baru"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#034EA2]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
                        <input
                          type="password"
                          placeholder="Ulangi password baru"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#034EA2]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#034EA2] hover:bg-[#023b7a] text-white rounded-lg py-2.5 text-sm font-semibold transition-all mt-2"
                      >
                        Simpan Password
                      </button>
                    </div>
                  </form>

                  {/* Form Ganti Email */}
                  <form onSubmit={handleEmailChange} autoComplete="off" className="bg-white border border-slate-300 rounded-xl p-6 shadow-none">
                    <h2 className="text-base font-bold text-[#0D1B3E] mb-4">Ganti Email</h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Saat Ini</label>
                        <input
                          type="text"
                          disabled
                          value={profile.email || ""}
                          className="w-full bg-[#EAEFF5] border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Baru</label>
                        <input
                          type="email"
                          autoComplete="new-email"
                          placeholder="Masukkan email baru"
                          value={emailForm.newEmail}
                          onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#034EA2]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Konfirmasi</label>
                        <input
                          type="password"
                          autoComplete="new-password"
                          placeholder="Masukkan password konfirmasi"
                          value={emailForm.password}
                          onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#034EA2]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#034EA2] hover:bg-[#023b7a] text-white rounded-lg py-2.5 text-sm font-semibold transition-all mt-2"
                      >
                        Simpan Email
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}