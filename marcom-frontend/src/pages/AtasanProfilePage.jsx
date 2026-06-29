import { useEffect, useState } from "react";
import AtasanSidebar from "../components/atasan/AtasanSidebar";
import {
  getProfile,
  changePassword,
  changeEmail,
} from "../services/atasan_profileService";

export default function AtasanProfilePage() {
  const [activeTab, setActiveTab] = useState("identity");
  const [profile, setProfile] = useState(null);

  // State untuk kontrol Pop-up / Toast Notification
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // 'success' atau 'error'
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

  useEffect(() => {
    setEmailForm({
      newEmail: "",
      password: "",
    });

    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    loadProfile();
  }, []);

  // Fungsi pembantu untuk memicu pop-up modern
  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    
    // Pop-up otomatis hilang setelah 4 detik
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await changePassword(passwordForm);

      // Menggunakan pop-up modern sukses
      showNotification("Password berhasil diubah!", "success");

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      // Menggunakan pop-up modern gagal
      const errMsg = err.response?.data?.message || "Gagal mengubah password";
      showNotification(errMsg, "error");
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    try {
      await changeEmail(emailForm);

      // Menggunakan pop-up modern sukses
      showNotification("Email berhasil diubah!", "success");

      setEmailForm({
        newEmail: "",
        password: "",
      });

      loadProfile();
    } catch (err) {
      // Menggunakan pop-up modern gagal
      const errMsg = err.response?.data?.message || "Gagal mengubah email";
      showNotification(errMsg, "error");
    }
  };

  if (!profile) return null;

  return (
    <div className="flex h-screen bg-[#F6F8FB] relative">
      
      {/* KODE POP-UP / TOAST MODERN */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {/* Icon Status */}
            {toast.type === "success" ? (
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <AtasanSidebar activeMenu="profile" />

      <div className="flex-1 overflow-y-scroll">
        <div className="bg-white border-b border-slate-200 px-8 py-4">
          <h1 className="text-xl font-bold">Profil Saya</h1>
        </div>

        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
              
              {/* TAB */}
              <div className="flex w-full gap-3 mb-6">
                <button
                  onClick={() => setActiveTab("identity")}
                  className={`flex-1 px-6 py-2 rounded-xl text-sm font-medium border transition ${
                    activeTab === "identity"
                      ? "bg-orange-700 text-white border-orange-700"
                      : "bg-white text-slate-600 border-slate-300 hover:border-orange-300"
                  }`}
                >
                  Identitas
                </button>

                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex-1 px-6 py-2 rounded-xl text-sm font-medium border transition ${
                    activeTab === "security"
                      ? "bg-orange-700 text-white border-orange-700"
                      : "bg-white text-slate-600 border-slate-300 hover:border-orange-300"
                  }`}
                >
                  Keamanan Akun
                </button>
              </div>

              {/* IDENTITAS */}
              {activeTab === "identity" && (
                <>
                  <div className="flex justify-center mb-5">
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-700">
                      {profile.name?.charAt(0)}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                      <span className="font-medium text-slate-700">Nama Lengkap</span>
                      <div className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-2">
                        {profile.name}
                      </div>
                    </div>

                    <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                      <span className="font-medium text-slate-700">Email</span>
                      <div className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-2">
                        {profile.email}
                      </div>
                    </div>

                    <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                      <span className="font-medium text-slate-700">Role</span>
                      <div className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-2">
                        {profile.role}
                      </div>
                    </div>

                    <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                      <span className="font-medium text-slate-700">Divisi</span>
                      <div className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-2">
                        {profile.divisi || "-"}
                      </div>
                    </div>

                    <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                      <span className="font-medium text-slate-700">Jabatan</span>
                      <div className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-2">
                        {profile.jabatan || "-"}
                      </div>
                    </div>

                    <div className="mt-4 bg-orange-50 border border-orange-200 text-orange-700 text-xs rounded-lg p-3">
                      Nama, role, divisi, dan jabatan dikelola oleh Admin Sistem.
                    </div>
                  </div>
                </>
              )}

              {/* KEAMANAN */}
              {activeTab === "security" && (
                <div className="space-y-5">
                  <form
                    onSubmit={handlePasswordChange}
                    className="border border-slate-200 rounded-xl p-4"
                  >
                    <h2 className="text-lg font-semibold mb-4">Ganti Password</h2>

                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="Password Lama"
                        value={passwordForm.oldPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            oldPassword: e.target.value,
                          })
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />

                      <input
                        type="password"
                        placeholder="Password Baru"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />

                      <input
                        type="password"
                        placeholder="Konfirmasi Password Baru"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />

                      <button
                        type="submit"
                        className="w-full bg-orange-700 hover:bg-orange-800 text-white rounded-lg py-2.5 text-sm font-medium"
                      >
                        Simpan Password
                      </button>
                    </div>
                  </form>

                  <form
                    onSubmit={handleEmailChange}
                    autoComplete="off"
                    className="border border-slate-200 rounded-xl p-4"
                  >
                    <h2 className="text-lg font-semibold mb-4">Ganti Email</h2>

                    <div className="space-y-3">
                      <input
                        disabled
                        value={profile.email}
                        className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />

                      <input
                        type="email"
                        autoComplete="new-email"
                        placeholder="Email Baru"
                        value={emailForm.newEmail}
                        onChange={(e) =>
                          setEmailForm({
                            ...emailForm,
                            newEmail: e.target.value,
                          })
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />

                      <input
                        type="password"
                        autoComplete="new-password"
                        placeholder="Konfirmasi Password"
                        value={emailForm.password}
                        onChange={(e) =>
                          setEmailForm({
                            ...emailForm,
                            password: e.target.value,
                          })
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />

                      <button
                        type="submit"
                        className="w-full bg-orange-700 hover:bg-orange-800 text-white rounded-lg py-2.5 text-sm font-medium"
                      >
                        Simpan Email
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}