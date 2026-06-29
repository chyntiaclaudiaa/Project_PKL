import { Search } from "lucide-react";
import Select from "react-select";

export default function RequestFilterBar({ search, setSearch, status, setStatus }) {
  return (
    <div className="w-full flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
      
      {/* Search Input Box */}
      <div className="relative flex-1">
        <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari ID, Judul, PIC, nomor surat..."
          className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition-colors duration-200"
        />
      </div>

      <div className="w-full md:w-40">
        <Select
          value={[
            { value: "", label: "Semua" },
            { value: "Menunggu", label: "Menunggu" },
            { value: "Diproses", label: "Diproses" },
            { value: "Revisi", label: "Revisi" },
            { value: "Selesai", label: "Selesai" },
            { value: "Ditolak", label: "Ditolak" },
          ].find((item) => item.value === status)}
          options={[
            { value: "", label: "Semua" },
            { value: "Menunggu", label: "Menunggu" },
            { value: "Diproses", label: "Diproses" },
            { value: "Revisi", label: "Revisi" },
            { value: "Selesai", label: "Selesai" },
            { value: "Ditolak", label: "Ditolak" },
          ]}
          onChange={(selected) => setStatus(selected.value)}
          isSearchable={false}
          styles={{
            control: (base, state) => ({
              ...base,
              minHeight: "42px",
              minWidth: "100%",
              width: "100%",
              borderRadius: "8px",
              borderColor: state.isFocused ? "#94a3b8" : "#CBD5E1",
              boxShadow: "none",
              fontSize: "14px",
              "&:hover": { borderColor: "#94a3b8" },
            }),
            indicatorSeparator: () => ({ display: "none" }),
            menu: (base) => ({
              ...base,
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,.08)",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected ? "#E2E8F0" : state.isFocused ? "#F8FAFC" : "#fff",
              color: "#334155",
              cursor: "pointer",
              padding: "10px 14px",
              fontSize: "14px",
              ":active": { backgroundColor: "#CBD5E1" },
            }),
          }}
        />
      </div>
    </div>
  );
}