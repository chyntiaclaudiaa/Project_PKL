import { Search } from "lucide-react";
import Select from "react-select";

export default function RequestFilterBar({
  search,
  setSearch,
  status,
  setStatus,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row gap-4 justify-between shadow-sm">
      
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-3 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Cari ID, Judul, PIC, Deadline, Platform, Status..."
          className="
            w-full
            border
            border-slate-300
            rounded-lg
            pl-10
            pr-4
            py-3
            focus:outline-none
            focus:ring-1
            focus:ring-orange-500
          "
        />
      </div>

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
            minHeight: "46px",
            minWidth: "180px",
            borderRadius: "8px",
            borderColor: state.isFocused
              ? "#dc5a14"
              : "#CBD5E1",
            boxShadow: state.isFocused
              ? "0 0 0 2px rgba(235, 145, 19, 0.25)"
              : "none",
            "&:hover": {
              borderColor: "#dc5a14",
            },
          }),

          indicatorSeparator: () => ({
            display: "none",
          }),

          menu: (base) => ({
            ...base,
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 10px 25px rgba(0,0,0,.12)",
          }),

          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? "#FED7AA"
              : state.isFocused
              ? "#FFF7ED"
              : "#fff",
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
        }}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: "#dc5a14",
            primary25: "#FFF7ED",
            primary50: "#FED7AA",
            primary75: "#FDBA74",
          },
        })}
      />
    </div>
  );
}