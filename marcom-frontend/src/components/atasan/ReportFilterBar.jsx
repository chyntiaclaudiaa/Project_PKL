import { CalendarDays, Download } from "lucide-react";

export default function ReportFilterBar({ startDate, setStartDate, endDate, setEndDate, onExport }) {
  return (
    <div className="flex items-center justify-between w-full gap-4">
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-sm">
        <CalendarDays className="w-4 h-4 text-slate-400" />
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
          className="focus:outline-none bg-transparent"
        />
        <span className="text-slate-400">s/d</span>
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} 
          className="focus:outline-none bg-transparent"
        />
      </div>

      <button
        onClick={onExport}
        className="text-white rounded-lg px-5 py-2 text-sm font-medium transition whitespace-nowrap flex items-center gap-2 hover:opacity-90"
        style={{ backgroundColor: '#034EA2' }} 
      >
        <Download className="w-4 h-4" />
        Export PDF
      </button>
    </div>
  );
}