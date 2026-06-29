import { useNavigate } from "react-router-dom";
import { HouseIcon, Plus, ListIcon, LogOut, Users, User } from "lucide-react";
import LogoBankSumut from "../../assets/Bank_Sumut.png"; 
import "../../style/atasan_dashboard.css";

export default function AtasanSidebar({ activeMenu }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Chairun Nisaq", jabatan: "Anggota MarCom" };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { key: "dashboard", label: "Dashboard Monitoring", icon: HouseIcon, path: "/atasan/dashboard" },
    { key: "request", label: "Semua Request", icon: Plus, path: "/atasan/request" },
    { key: "report", label: "Rekap Request", icon: ListIcon, path: "/atasan/report" },
    { key: "profile", label: "Profil Saya", icon: Users, path: "/atasan/profile" }
  ];

  return (
    <div className="sticky top-0 h-screen w-64 text-white flex flex-col justify-between border-r border-slate-300 sidebar-gradient-bg z-50 shrink-0">
      {/* TOP SECTION */}
      <div>
        {/* LOGO & BRAND */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
          <img src={LogoBankSumut} alt="Marcom System" className="w-10 h-10 object-contain shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-tight tracking-wide">Marcom System</h1>
            <p className="text-white/60 text-xs font-light">Marketing Communication</p>
          </div>
        </div>

        {/* ROLE INFO */}
        <div className="mx-4 mt-4 px-4 py-2.5 bg-white/10 rounded-lg border border-white/5">
          <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Role Aktif</p>
          <div className="flex items-center gap-2 mt-0.5">
            <User size={14} strokeWidth={2} className="text-gray-200" />
            <span className="text-xs font-bold text-white">Pemimpin Bidang</span>
          </div>
        </div>

        {/* MENU ITEMS */}
        <div className="px-3 space-y-1 mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.key;

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
              {user?.name?.charAt(0) || "C"}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-white truncate">{user?.name || "Chairun Nisaq"}</p>
              <p className="text-white/50 text-[10px] truncate">{user?.jabatan || "Anggota MarCom"}</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="text-white/60 hover:text-red-400 hover:border-red-400/40 transition-all border border-white/20 p-2 rounded-lg flex items-center justify-center bg-white/5"
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}