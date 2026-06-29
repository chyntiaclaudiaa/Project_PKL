import { useEffect, useState, useRef, useLayoutEffect } from "react";
import AtasanSidebar from "../components/atasan/AtasanSidebar";
import ReportSummaryCards from "../components/atasan/ReportSummaryCards";
import WorkloadTable from "../components/atasan/WorkloadTable";
import PriorityRequestTable from "../components/atasan/PriorityRequestTable";
import StatusPieChart from "../components/atasan/StatusPieChart";
import WorkloadBarCharts from "../components/atasan/WorkloadBarCharts";

// Import ikon kalender langsung ke file ini
import { CalendarDays } from "lucide-react"; 

import {
  getSummary,
  getWorkload,
  getPriorityRequests,
  getStatusDistribution,
  getRequestDetail,
} from "../services/atasan_dashboardService";
import { useLocation } from "react-router-dom";

export default function AtasanDashboardMonitoring() {
  const scrollRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [priority, setPriority] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const location = useLocation();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comments, setComments] = useState([]);

  // State untuk filter tanggal (Default: awal bulan ini sampai hari ini)
  const todayStr = new Date().toISOString().split("T")[0];
  const firstDayStr = `${todayStr.substring(0, 8)}01`;
  
  const [startDate, setStartDate] = useState(firstDayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // 1. Memuat data dashboard (Akan terpicu otomatis setiap kali tanggal startDate/endDate diubah)
  useEffect(() => {
    loadDashboard(startDate, endDate);
  }, [startDate, endDate]);

  const loadDashboard = async (start, end) => {
    try {
      const [
        summaryData,
        workloadData,
        priorityData,
        distributionData,
      ] = await Promise.all([
        getSummary(start, end),
        getWorkload(start, end),
        getPriorityRequests(start, end),
        getStatusDistribution(start, end),
      ]);

      setSummary(summaryData);
      setWorkload(workloadData);
      setPriority(priorityData);
      setDistribution(distributionData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    // isi nanti kalau sudah ada fitur komentar
  };

  const handleSelectRequest = async (id) => {
    try {
      const res = await getRequestDetail(id);
      console.log("DETAIL:", res);
      setSelectedRequest(res);
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Mengelola posisi scroll secara sinkronus agar tidak terjadi jump visual
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
    
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [summary]); 

  console.log("selectedRequest =", selectedRequest);

  const savedHeight = sessionStorage.getItem("dashboard-height") || "1000";

  return (
    <div className="flex h-screen bg-[#f4f6f9]">
      <AtasanSidebar activeMenu="dashboard" />

      <div ref={scrollRef} className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <h1 className="text-xl font-bold">Dashboard Monitoring</h1>
          <p className="text-sm text-gray-500">
            Monitoring seluruh request konten MarCom
          </p>
        </header>

        <main className="p-4 space-y-4">
          
          {/* FILTER BAR BUILT-IN (LANGSUNG DI FILE INI) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap gap-4 shadow-sm">
            
            {/* Input Tanggal Mulai */}
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block">
                Tanggal Mulai
              </label>
              <div className="relative">
                <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Input Sampai Tanggal */}
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block">
                Sampai Tanggal
              </label>
              <div className="relative">
                <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

          </div>

          {!summary ? (
            /* Komponen Loading */
            <div 
              style={{ minHeight: `${savedHeight}px` }}
              className="flex items-start justify-center pt-32 text-gray-500 font-medium"
            >
              Memuat data dashboard...
            </div>
          ) : (
            /* Tampilan Konten Dashboard */
            <>
              <ReportSummaryCards summary={summary} />

              <StatusPieChart data={distribution} />

              <WorkloadBarCharts workload={workload} />

              <WorkloadTable data={workload} />

              <PriorityRequestTable
                data={priority}
                onSelectRequest={handleSelectRequest}
              />

              {selectedRequest && (
                <RequestDetailPanel 
                  request={selectedRequest}
                  comments={comments}
                  onAddComment={handleAddComment}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}