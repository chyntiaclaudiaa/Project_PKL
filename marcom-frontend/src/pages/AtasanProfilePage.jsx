import { useEffect, useState } from "react";
import AtasanSidebar from "../components/atasan/AtasanSidebar";
import { getProfile } from "../services/atasan_profileService";
import ProfilUser from "../components/ProfilUser"; 

export default function AtasanProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const showNotification = (message, type = "success") => {
    setToast({ show: false, message: "", type: "success" }); 
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

  const handleUpdateUser = (updatedData) => {
    setProfile(updatedData);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F8FB] relative font-sans text-slate-700">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 transition-all duration-300">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-md border text-sm font-medium text-white ${
              toast.type === "error"
                ? "bg-[#E7000B] border-[#E7000B]" 
                : "bg-[#1D9E75] border-[#1D9E75]"
            }`}
          >
            {toast.type === "error" ? (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="sticky top-0 h-screen z-20">
        <AtasanSidebar activeMenu="profile" />
      </div>

      {/* CONTAINER KANAN */}
      <div className="flex-1 h-screen flex flex-col overflow-y-auto bg-[#F6F8FB]">
        
        {/* HEADER MINI */}
        <header className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex flex-col justify-center shrink-0 z-10">
          <h1 className="text-base font-bold text-[#0D1B3E] leading-tight">Profile Saya</h1>
        </header>

        {/* MAIN CONTAINER */}
        <main className="p-6 md:p-8 w-full max-w-4xl flex-1">
          
          {isLoading ? (
            <div className="text-center py-10 text-slate-400 text-sm">Memuat data profil...</div>
          ) : !profile ? (
            <div className="text-center py-10 text-rose-500 text-sm">Gagal memuat profil.</div>
          ) : (
            <ProfilUser 
              userData={profile} 
              onUpdateUser={handleUpdateUser}
              setToast={(toastState) => showNotification(toastState.message, toastState.type || "success")}
            />
          )}

        </main>
      </div>
    </div>
  );
}