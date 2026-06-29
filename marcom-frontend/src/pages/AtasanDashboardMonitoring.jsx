import { useEffect, useState, useRef, useLayoutEffect } from "react";
import AtasanSidebar from "../components/atasan/AtasanSidebar";
import ReportSummaryCards from "../components/atasan/ReportSummaryCards";
import WorkloadTable from "../components/atasan/WorkloadTable";
import StatusPieChart from "../components/atasan/StatusPieChart";
import WorkloadBarCharts from "../components/atasan/WorkloadBarCharts";
import PriorityRequestTable from "../components/atasan/PriorityRequestTable";
import AtasanRequestDetailPage from "./AtasanRequestDetailPage"; 
import NotificationPopup from "../components/atasan/NotificationPopup"; 
import { MessageCircle } from "lucide-react"; 

import {
  getSummary,
  getWorkload,
  getStatusDistribution,
  getPriorityRequests,
  getCommentNotifications, 
  markNotificationAsRead,   
} from "../services/atasan_dashboardService"; 
import "../atasan_dashboard.css";

export default function AtasanDashboardMonitoring() {
  const scrollRef = useRef(null);
  const startPickerRef = useRef(null);
  const endPickerRef = useRef(null);

  const [summary, setSummary] = useState({ menunggu: 0, diproses: 0, revisi: 0, selesai: 0, ditolak: 0, total: 0 });
  const [workload, setWorkload] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const getLocalDateStrings = () => {
    const sekarang = new Date();
    const tahun = sekarang.getFullYear();
    const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
    const hari = String(sekarang.getDate()).padStart(2, '0');
    return {
      awalBulan: `${tahun}-${bulan}-01`,
      hariIni: `${tahun}-${bulan}-${hari}`
    };
  };

  const { awalBulan, hariIni } = getLocalDateStrings();
  
  const [startDate, setStartDate] = useState(() => sessionStorage.getItem("dashboard-start-date") || awalBulan);
  const [endDate, setEndDate] = useState(() => sessionStorage.getItem("dashboard-end-date") || hariIni);

  useEffect(() => {
    sessionStorage.setItem("dashboard-start-date", startDate);
    sessionStorage.setItem("dashboard-end-date", endDate);
    loadDashboard(startDate, endDate);
    loadNotifications(); 
  }, [startDate, endDate]);

  const loadDashboard = async (start, end) => {
    try {
      const [summaryData, workloadData, distributionData, priorityRequestsData] = await Promise.all([
        getSummary(start, end),
        getWorkload(start, end),
        getStatusDistribution(start, end),
        getPriorityRequests(start, end),
      ]);

      if (summaryData) {
        setSummary(summaryData);
      } else {
        setSummary({ menunggu: 0, diproses: 0, revisi: 0, selesai: 0, ditolak: 0, total: 0 });
      }
      
      setWorkload(workloadData || []);
      setDistribution(distributionData || []);
      setPriorityData(priorityRequestsData || []);
    } catch (err) {
      console.error("Gagal memuat data dashboard atau data tidak ditemukan:", err);
      
      setSummary({ menunggu: 0, diproses: 0, revisi: 0, selesai: 0, ditolak: 0, total: 0 });
      setWorkload([]);
      setDistribution([]);
      setPriorityData([]);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getCommentNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error("Gagal mengambil daftar notifikasi komentar:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      const isUnread = notif.is_read === false || String(notif.is_read) === "false" || notif.is_read === 0 || notif.is_read === "0";
      if (isUnread) {
        await markNotificationAsRead(notif.comment_id);
        await loadNotifications(); 
      }
      setIsPopupOpen(false); 
      setSelectedRequestId(notif.request_id); 
    } catch (err) {
      console.error("Gagal memperbarui status baca notifikasi:", err);
    }
  };

  useLayoutEffect(() => {
    if (!summary) return;
    const container = scrollRef.current;
    if (!container) return;

    const savedScroll = sessionStorage.getItem("dashboard-scroll");
    if (savedScroll) {
      container.scrollTop = parseInt(savedScroll, 10);
    }

    const handleScroll = () => {
      sessionStorage.setItem("dashboard-scroll", container.scrollTop);
      sessionStorage.setItem("dashboard-height", container.scrollHeight);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [summary]); 

  const handleOpenStartPicker = () => {
    if (startPickerRef.current && typeof startPickerRef.current.showPicker === 'function') {
      startPickerRef.current.showPicker();
    }
  };

  const handleOpenEndPicker = () => {
    if (endPickerRef.current && typeof endPickerRef.current.showPicker === 'function') {
      endPickerRef.current.showPicker();
    }
  };

  const totalAktif = summary 
    ? (Number(summary.menunggu || 0) + Number(summary.diproses || 0) + Number(summary.revisi || 0)) 
    : 0;

  const namaDepanUser = summary?.user_logged_name
    ? summary.user_logged_name.split(" ")[0].replace(/^\w/, (c) => c.toUpperCase())
    : "User";

  const totalTugasSeluruhAnggota = workload.reduce((acc, curr) => acc + Number(curr.total_request || 0), 0);

  const hasUnread = notifications.some(
    (notif) => notif.is_read === false || String(notif.is_read) === "false" || notif.is_read === 0 || notif.is_read === "0"
  );

  return (
    <div className="flex h-screen bg-[#fafbfc] relative">
      <AtasanSidebar activeMenu="dashboard" />

      <div ref={scrollRef} id="dashboard-scroll-container" className="flex-1 overflow-auto">
        <header className="bg-white px-8 py-5 flex justify-between items-center border-b border-slate-200 sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Dashboard Saya</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {summary ? `${summary.total || 0} total request · ${totalAktif} aktif` : "0 total request · 0 aktif"}
            </p>
          </div>

          <div className="relative flex items-center pr-2">
            <button 
              onClick={() => setIsPopupOpen(!isPopupOpen)}
              className="p-1.5 text-orange-500 rounded-full hover:bg-slate-100 transition-colors relative focus:outline-none"
            >
              <MessageCircle size={28} className="text-orange-500 stroke-[2]" fill="currentColor" />
              
              {hasUnread && (
                <span className="absolute top-1 left-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </button>

            {isPopupOpen && (
              <NotificationPopup 
                notifications={notifications}
                onClose={() => setIsPopupOpen(false)}
                onNotificationClick={handleNotificationClick}
              />
            )}
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-[1400px] mx-auto">
          <div className="welcome-gradient-bg p-6 rounded-2xl text-white relative overflow-hidden shadow-none border border-slate-300">
            <h2 className="text-lg font-bold">Selamat datang, {namaDepanUser}!</h2>
            <p className="text-white/70 text-xs mt-1 font-light">Pantau dan kelola request workload anggota dari sini</p>
          </div>

          <div className="flex items-center gap-4 py-3 border-y border-blue-600 w-full select-none">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleOpenStartPicker}>
              <div className="relative">
                <input 
                  ref={startPickerRef}
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer text-sm custom-date-picker"
                />
              </div>
            </div>

            <span className="font-medium text-slate-500 text-xs px-1">s/d</span>

            <div className="flex items-center gap-2 cursor-pointer" onClick={handleOpenEndPicker}>
              <div className="relative">
                <input 
                  ref={endPickerRef}
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer text-sm custom-date-picker"
                />
              </div>
            </div>
          </div>

          <ReportSummaryCards summary={summary} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <StatusPieChart data={distribution} />
            </div>
            <div className="lg:col-span-7">
              <WorkloadBarCharts workload={workload} />
            </div>
          </div>

          <WorkloadTable data={workload} globalTotal={totalTugasSeluruhAnggota} />
          
          <PriorityRequestTable 
            data={priorityData} 
            onOpenDetail={(id) => setSelectedRequestId(id)} 
          />
        </main>
      </div>

      {selectedRequestId && (
        <AtasanRequestDetailPage 
          requestId={selectedRequestId} 
          onClose={() => {
            setSelectedRequestId(null);
            loadDashboard(startDate, endDate); 
            loadNotifications();
          }} 
        />
      )}
    </div>
  );
}