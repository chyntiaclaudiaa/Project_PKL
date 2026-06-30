import { useNavigate } from 'react-router-dom';
import {
  Home,
  Plus,
  List,
  Upload,
  User,
} from 'lucide-react'; 

import logoKecilBankSumut from "../assets/Logo_Kecil_Bank_Sumut.png";
import '../style/atasan_dashboard.css'; 
import '../style/Sidebar.css'; 

function Sidebar({ user, active, onLogout }) {
  const navigate = useNavigate();

  const menuItems = [
    { key: 'dashboard', label: 'Beranda', icon: Home, path: '/anggota/dashboard' },
    { key: 'request', label: 'Input Request', icon: Plus, path: '/anggota/input-request' },
    { key: 'myrequest', label: 'Request Saya', icon: List, path: '/anggota/requests' },
    { key: 'upload', label: 'Upload Hasil', icon: Upload, path: '/anggota/upload-hasil' },
    { key: 'profile', label: 'Profil Saya', icon: User, path: '/anggota/profile' },
  ];

  return (
    <div className="sticky top-0 h-screen w-64 text-white flex flex-col justify-between border-r border-slate-300 sidebar-gradient-bg z-50 shrink-0">
      {/* TOP SECTION */}
      <div>
        {/* LOGO & BRAND */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
          <img src={logoKecilBankSumut} alt="MarCom System" className="w-10 h-10 object-contain shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-tight tracking-wide">MarCom System</h1>
            <p className="text-white/60 text-xs font-light">Marketing Communication</p>
          </div>
        </div>

        {/* ROLE INFO */}
        <div className="mx-4 mt-4 px-4 py-2.5 bg-white/10 rounded-lg border border-white/5">
          <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Role Aktif</p>
          <div className="flex items-center gap-2 mt-0.5">
            <User size={14} strokeWidth={2} className="text-gray-200" />
            <span className="text-xs font-bold text-white">{user?.role || 'Anggota'}</span>
          </div>
        </div>

        {/* MENU ITEMS */}
        <div className="px-3 space-y-1 mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;

            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`group w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#39293C] text-[#EC5D34]"
                    : "text-[#9AA8C7] hover:text-orange-500"
                }`}
              >
                <Icon
                  size={22}
                  className={isActive ? "text-[#EC5D34]" : "text-[#9AA8C7] group-hover:text-orange-500"}
                />

                <span className="text-sm font-semibold">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM SECTION - PROFILE USER */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-white truncate" title={user?.name}>{user?.name || "User"}</p>
              <p className="text-white/50 text-[10px] truncate">{user?.role?.replace('_', ' ') || "Anggota"}</p>
            </div>
          </div>
          
          {/* Tombol Logout dengan Ikon Panah Keluar (Stroke) */}
          <button
            onClick={onLogout}
            className="text-white/60 hover:text-orange-400 hover:border-orange-400/40 transition-all border border-white/20 p-2 rounded-lg flex items-center justify-center bg-white/5"
            title="Keluar"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-4 h-4"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" 
              />
            </svg>
          </button>
          
        </div>
      </div>
    </div>
  );
}

export default Sidebar;