import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

import AtasanSidebar from "../components/atasan/AtasanSidebar";
import ReportFilterBar from "../components/atasan/ReportFilterBar";
import ReportSummaryCards from "../components/atasan/ReportSummaryCards";
import ReportWorkloadBar from "../components/atasan/ReportWorkloadBar";
import ReportDetailTable from "../components/atasan/ReportDetailTable";

import { getReportData } from "../services/atasan_reportService";

export default function AtasanReportPage() {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(new Date().getDate() - 30);
  const defaultStartDate = thirtyDaysAgo.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(() => {
    return localStorage.getItem("report_startDate") || defaultStartDate;
  });
  const [endDate, setEndDate] = useState(() => {
    return localStorage.getItem("report_endDate") || today;
  });

  const [summary, setSummary] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [details, setDetails] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "loading" });

  useEffect(() => {
    localStorage.setItem("report_startDate", startDate);
    localStorage.setItem("report_endDate", endDate);
    loadData();
  }, [startDate, endDate]);

  useEffect(() => {
    const scrollContainer = document.getElementById("report-right-layout");
    if (!scrollContainer) return;

    const savedScrollPos = localStorage.getItem("report_scroll_position");
    if (savedScrollPos) {
      scrollContainer.scrollTop = parseInt(savedScrollPos, 10);
    }

    const handleScroll = () => {
      localStorage.setItem("report_scroll_position", scrollContainer.scrollTop);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [summary]);

  const loadData = async () => {
    try {
      const res = await getReportData(startDate, endDate);
      setSummary(res.data.summary);
      setWorkload(res.data.workload);
      setDetails(res.data.details);
    } catch (err) {
      console.error(err);
    }
  };

  const exportPDF = async () => {
    
    setToast({ show: true, message: "Sedang menyiapkan dokumen PDF...", type: "loading" });
    try {
      const element = document.getElementById("report-export-area");
      
      element.classList.add("hide-scrollbar-for-export");
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2 });
      
      element.classList.remove("hide-scrollbar-for-export");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`rekap-request-${startDate}-to-${endDate}.pdf`);

      setToast({ show: true, message: "Laporan PDF berhasil diunduh!", type: "success" });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    } catch (err) {
      console.error(err);
      document.getElementById("report-export-area")?.classList.remove("hide-scrollbar-for-export");
      setToast({ show: true, message: "Gagal mengunduh dokumen PDF.", type: "error" });
    }
  };

  const formatIndoDate = (dateStr) => {
    if (!dateStr) return "";
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  if (!summary) return null;

  const totalTanpaDitolak = 
    (Number(summary.menunggu) || 0) + 
    (Number(summary.diproses) || 0) + 
    (Number(summary.revisi) || 0) + 
    (Number(summary.selesai) || 0);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F8FB] text-slate-700 items-start">
      
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-sm font-bold max-w-md transition-all duration-300
          ${toast.type === "success" ? "bg-green-600 text-white" : ""}
          ${toast.type === "error" ? "bg-red-600 text-white" : ""}
          ${toast.type === "loading" ? "bg-blue-50 border border-blue-200 text-blue-800 backdrop-blur-sm" : ""}
        `}>
          {toast.type === "loading" && (
            <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {toast.type === "success" && (
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === "error" && (
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="sticky top-0 h-screen z-20">
        <AtasanSidebar activeMenu="report" />
      </div>

      <div id="report-right-layout" className="flex-1 h-screen flex flex-col overflow-y-auto bg-[#F6F8FB]">
        
        <header className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex flex-col justify-center shrink-0 z-30 ">
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Rekap Request</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Export laporan monitoring</p>
          </div>
          
          <div className="mt-3.5 w-full">
            <ReportFilterBar 
              startDate={startDate} 
              setStartDate={setStartDate} 
              endDate={endDate} 
              setEndDate={setEndDate} 
              onExport={exportPDF} 
            />
          </div>
        </header>

        {/* AREA KONTEN */}
        <main className="p-6 space-y-6 flex-1">
          <div id="report-export-area" className="space-y-8 bg-[#F6F8FB] p-2">
            
            <div className="bg-blue-50 text-[#034EA2] px-4 py-2.5 rounded-lg text-xs font-medium border border-blue-100/70 mb-2">
              Periode: <span className="font-semibold">{formatIndoDate(startDate)} - {formatIndoDate(endDate)}</span> &bull; Generated: <span className="font-semibold">{formatIndoDate(new Date())}</span>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-3">Ringkasan Status</h2>
              <ReportSummaryCards summary={summary} />
            </div>

            <div className="pt-2">
              <div className="border-b border-slate-200 pb-2 mb-4">
                <h2 className="text-sm font-bold text-slate-800">Distribusi Request per Status</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Menunggu", count: summary.menunggu, color: "text-orange-600" },
                  { label: "Diproses", count: summary.diproses, color: "text-blue-600" },
                  { label: "Revisi", count: summary.revisi, color: "text-amber-600" },
                  { label: "Selesai", count: summary.selesai, color: "text-green-600" }
                ].map((item) => {
                  const percentage = totalTanpaDitolak > 0 ? (item.count / totalTanpaDitolak) * 100 : 0;
                  return (
                    <div key={item.label} className="flex items-center text-xs">
                      <div className={`w-20 font-bold ${item.color}`}>{item.label}</div>
                      <div className="flex-1 bg-slate-100 h-6 rounded-md overflow-hidden mx-4 relative border border-slate-200">
                        <div 
                          className="h-full rounded-md transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            background: 'linear-gradient(180deg, #FF6900 0%, #FF8C38 100%)'
                          }}
                        />
                      </div>
                      <div className="w-12 text-right text-slate-500 font-medium">{item.count} req</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <div className="border-b border-slate-200 pb-2 mb-4">
                <h2 className="text-sm font-bold text-slate-800">Workload Anggota</h2>
              </div>
              <div>
                <ReportWorkloadBar data={workload} grandTotal={summary.total} />
              </div>
            </div>

            <div className="pt-2">
              <div className="border-b border-slate-200 pb-2 mb-4">
                <h2 className="text-sm font-bold text-slate-800">Daftar Semua Request</h2>
              </div>
              <div>
                <ReportDetailTable data={details} />
              </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}