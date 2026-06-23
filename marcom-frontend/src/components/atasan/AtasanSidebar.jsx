import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import {
  LayoutDashboard,
  List,
  FileDown,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function AtasanSidebar({ activeMenu }) {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard Monitoring",
      icon: LayoutDashboard,
      path: "/atasan/dashboard",
    },
    {
      key: "request",
      label: "Semua Request",
      icon: List,
      path: "/atasan/request",
    },
    {
      key: "report",
      label: "Rekap Request",
      icon: FileDown,
      path: "/atasan/report",
    },
    {
      key: "profile",
      label: "Profil Saya",
      path: "/atasan/profile",
      icon: User,
    }
  ];

  return (
    <div className="w-60 bg-[#071B4D] text-white flex flex-col justify-between border-r border-white/10">

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-[#FF6B35] flex items-center justify-center text-lg font-bold shrink-0">
              M
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight truncate">
                MarCom System
              </h1>

              <p className="text-[#A5B4D4] text-xs truncate">
                Marketing Communication
              </p>
            </div>

          </div>
        </div>

        {/* MENU */}
        <div className="p-3 space-y-1.5 mt-2">

          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              activeMenu === item.key;

            return (
              <button
                key={item.key}
                onClick={() =>
                  navigate(item.path)
                }
                className={`
                  w-full
                  flex
                  items-center
                  justify-between
                  px-3
                  py-3
                  rounded-xl
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? "bg-[#3C2943]"
                      : "hover:bg-white/5"
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-0">

                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-[#FF6B35]"
                        : "text-[#A5B4D4]"
                    }
                  />

                  <span
                    className={`
                      text-sm
                      font-semibold
                      whitespace-nowrap
                      truncate
                      ${
                        isActive
                          ? "text-[#FF6B35]"
                          : "text-[#A5B4D4]"
                      }
                    `}
                  >
                    {item.label}
                  </span>

                </div>
              </button>
            );
          })}

        </div>

      </div>

      {/* BOTTOM */}
      <div className="border-t border-white/10 p-3">

        {/* PROFILE */}
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center font-bold text-base shrink-0">
            {user?.name?.charAt(0) || "A"}
          </div>

          <div className="min-w-0">

            <p className="font-semibold text-sm truncate">
              {user?.name}
            </p>

            <p className="text-[#A5B4D4] text-xs truncate">
              {user?.jabatan}
            </p>

          </div>

        </div>

        {/* LOGOUT (PERBAIKAN WARNA KONDISI BIASA DAN HOVER DI SINI) */}
        <button
          onClick={logout}
          className="
            mt-3
            flex
            items-center
            gap-2
            text-white
            hover:text-[#B22222]
            transition-colors
            duration-200
            px-2
            py-1
            w-full
            rounded-lg
          "
        >
          <LogOut size={18} />

          <span className="text-sm font-medium">
            Keluar
          </span>
        </button>

      </div>

    </div>
  );
}