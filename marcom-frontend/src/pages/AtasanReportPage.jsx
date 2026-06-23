import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import Select from "react-select";

import AtasanSidebar from "../components/atasan/AtasanSidebar";
import ReportFilterBar from "../components/atasan/ReportFilterBar";
import ReportSummaryCards from "../components/atasan/ReportSummaryCards";
import ReportWorkloadBar from "../components/atasan/ReportWorkloadBar";
import ReportDetailTable from "../components/atasan/ReportDetailTable";

import {
  getReportData,
} from "../services/atasan_reportService";

export default function AtasanReportPage() {

  const today = new Date();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(
    today.getDate() - 30
  );

  const [startDate, setStartDate] =
    useState(
      thirtyDaysAgo
        .toISOString()
        .split("T")[0]
    );

  const [endDate, setEndDate] =
    useState(
      today
        .toISOString()
        .split("T")[0]
    );

  const [statusSort, setStatusSort] =
    useState("");

  const [deadlineSort, setDeadlineSort] =
    useState("asc");

  const [summary, setSummary] =
    useState(null);

  const [workload, setWorkload] =
    useState([]);

  const [details, setDetails] =
    useState([]);

  // STATE pop-up ekspor dokumen
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "loading", 
  });

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    try {
      const res =
        await getReportData(
          startDate,
          endDate
        );

      setSummary(
        res.data.summary
      );

      setWorkload(
        res.data.workload
      );

      setDetails(
        res.data.details
      );

    } catch (err) {
      console.error(err);
    }
  };

  const exportPDF = async () => {
    setToast({
      show: true,
      message: "Sedang menyiapkan dokumen PDF...",
      type: "loading",
    });

    try {
      const element =
        document.getElementById(
          "report-export-area"
        );

      const dataUrl =
        await toPng(element, {
          cacheBust: true,
          pixelRatio: 2,
        });

      const pdf =
        new jsPDF(
          "p",
          "mm",
          "a4"
        );

      pdf.setFontSize(16);

      pdf.text(
        "Laporan Rekap Request",
        10,
        12
      );

      pdf.setFontSize(10);

      pdf.text(
        `Periode : ${startDate} s/d ${endDate}`,
        10,
        18
      );

      const imgProps =
        pdf.getImageProperties(
          dataUrl
        );

      const pdfWidth =
        pdf.internal.pageSize.getWidth();

      const imgWidth =
        pdfWidth - 10;

      const imgHeight =
        (imgProps.height * imgWidth) /
        imgProps.width;

      pdf.addImage(
        dataUrl,
        "PNG",
        5,
        25,
        imgWidth,
        imgHeight
      );

      pdf.save(
        `rekap-request-${startDate}-${endDate}.pdf`
      );

      setToast({
        show: true,
        message: "Laporan PDF berhasil diunduh!",
        type: "success",
      });

      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);

    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        message: "Gagal mengunduh dokumen PDF.",
        type: "error",
      });

      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
    }
  };

  let filteredDetails =
    [...details];

  if (statusSort) {
    filteredDetails =
      filteredDetails.filter(
        (item) =>
          item.status ===
          statusSort
      );
  }

  filteredDetails.sort(
    (a, b) => {
      const dateA =
        new Date(
          a.deadline
        );

      const dateB =
        new Date(
          b.deadline
        );

      return deadlineSort === "asc"
        ? dateA - dateB
        : dateB - dateA;
    }
  );

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      minWidth: "190px",
      borderRadius: "12px",
      borderColor: state.isFocused
        ? "#C2410C"
        : "#CBD5E1",
      boxShadow: state.isFocused
        ? "0 0 0 3px rgba(194,65,12,.15)"
        : "none",
      "&hover": {
        borderColor: "#C2410C",
      },
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),

    dropdownIndicator: (base) => ({
      ...base,
      color: "#b6aca9",
      "&hover": {
        color: "#9A3412",
      },
    }),

    menu: (base) => ({
      ...base,
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 12px 24px rgba(0,0,0,.12)",
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#FED7AA"
        : state.isFocused
        ? "#FFF7ED"
        : "#FFFFFF",
      color: "#334155",
      cursor: "pointer",
      padding: "10px 14px",

      ":active": {
        backgroundColor: "#FDBA74",
      },
    }),

    singleValue: (base) => ({
      ...base,
      color: "#334155",
    }),

    valueContainer: (base) => ({
      ...base,
      paddingLeft: "8px",
    }),
  };

  const totalRequest =
    Number(
      summary?.total || 0
    );

  if (!summary)
    return null;

  return (
    <div className="flex h-screen bg-[#F6F8FB] relative">

      {/* RENDER POP-UP NOTIFIKASI MODERN (TOAST) */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : toast.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-amber-50 border-amber-200 text-amber-800" // Desain untuk Loading
            }`}
          >
            {/* Render Ikon Berdasarkan Tipe Status */}
            {toast.type === "loading" && (
              <svg className="animate-spin h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            
            {toast.type === "success" && (
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}

            {toast.type === "error" && (
              <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}

            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <AtasanSidebar activeMenu="report" />

      <div className="flex-1 overflow-auto">

        <div className="bg-white border-b border-slate-200 px-8 py-5">
          <h1 className="text-2xl font-bold">Laporan Request</h1>
          <p className="text-sm text-slate-500">
            Monitoring performa anggota dan statistik request konten
          </p>
        </div>

        <div className="p-8 pb-0">
          <ReportFilterBar
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onExport={exportPDF}
          />
        </div>

        {/* AREA PDF */}
        <div
          id="report-export-area"
          className="p-8 space-y-6"
        >
          <div className="text-sm text-slate-500">
            Periode :
            {" "}
            <span className="font-semibold">{startDate}</span>
            {" "}s/d{" "}
            <span className="font-semibold">{endDate}</span>
          </div>

          <ReportSummaryCards summary={summary} />

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">
              Distribusi Tugas Anggota
            </h2>

            <ReportWorkloadBar
              data={workload}
              grandTotal={totalRequest}
            />

            <div className="border-t border-slate-200 mt-6 pt-4 ">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Total Semua Request</span>
                <span className="font-semibold">{totalRequest}</span>
              </div>

              <div className="h-5 rounded-full overflow-hidden bg-slate-100 flex ">
                {summary.menunggu > 0 && (
                  <div
                    className="bg-orange-600"
                    style={{
                      width: `${(summary.menunggu / totalRequest) * 100}%`,
                    }}
                  />
                )}

                {summary.diproses > 0 && (
                  <div
                    className="bg-blue-600"
                    style={{
                      width: `${(summary.diproses / totalRequest) * 100}%`,
                    }}
                  />
                )}

                {summary.revisi > 0 && (
                  <div
                    className="bg-orange-700"
                    style={{
                      width: `${(summary.revisi / totalRequest) * 100}%`,
                    }}
                  />
                )}

                {summary.selesai > 0 && (
                  <div
                    className="bg-green-600"
                    style={{
                      width: `${(summary.selesai / totalRequest) * 100}%`,
                    }}
                  />
                )}

                {summary.ditolak > 0 && (
                  <div
                    className="bg-red-600"
                    style={{
                      width: `${(summary.ditolak / totalRequest) * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold">Daftar Request</h2>

              <div className="flex gap-3">
                <Select
                  value={[
                    { value: "", label: "Semua Status" },
                    { value: "Menunggu", label: "Menunggu" },
                    { value: "Diproses", label: "Diproses" },
                    { value: "Revisi", label: "Revisi" },
                    { value: "Selesai", label: "Selesai" },
                    { value: "Ditolak", label: "Ditolak" },
                  ].find(item => item.value === statusSort)}
                  options={[
                    { value: "", label: "Semua Status" },
                    { value: "Menunggu", label: "Menunggu" },
                    { value: "Diproses", label: "Diproses" },
                    { value: "Revisi", label: "Revisi" },
                    { value: "Selesai", label: "Selesai" },
                    { value: "Ditolak", label: "Ditolak" },
                  ]}
                  onChange={(selected) => setStatusSort(selected.value)}
                  isSearchable={false}
                  styles={selectStyles}
                />

                <Select
                  value={[
                    { value: "asc", label: "Deadline Terdekat" },
                    { value: "desc", label: "Deadline Terjauh" },
                  ].find(item => item.value === deadlineSort)}
                  options={[
                    { value: "asc", label: "Deadline Terdekat" },
                    { value: "desc", label: "Deadline Terjauh" },
                  ]}
                  onChange={(selected) => setDeadlineSort(selected.value)}
                  isSearchable={false}
                  styles={selectStyles}
                />
              </div>
            </div>

            <ReportDetailTable data={filteredDetails} />
          </div>
        </div>

      </div>
    </div>
  );
}