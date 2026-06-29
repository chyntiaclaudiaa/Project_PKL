import { Star } from "lucide-react";

export default function RequestTable({ data, onTogglePriority, onOpenDetail }) {

  const getStatusStyle = (status) => {
    switch (status) {
      case "Menunggu": return "badge-menunggu";
      case "Diproses": return "badge-diproses";
      case "Revisi": return "badge-revisi";
      case "Selesai": return "badge-selesai";
      case "Ditolak": return "badge-ditolak";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="bg-white custom-card-style overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-xs min-w-[800px]">
          <thead className="bg-gray-50 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 text-left font-bold text-slate-500 uppercase tracking-wide w-[10%]">ID</th>
              <th className="py-3 px-4 text-left font-bold text-slate-500 uppercase tracking-wide w-[35%]">Judul Konten</th>
              <th className="py-3 px-4 text-left font-bold text-slate-500 uppercase tracking-wide w-[15%]">PIC</th>
              <th className="py-3 px-4 text-left font-bold text-slate-500 uppercase tracking-wide w-[12%]">Deadline</th>
              <th className="py-3 px-4 text-left font-bold text-slate-500 uppercase tracking-wide w-[10%]">Platform</th>
              <th className="py-3 px-4 text-center font-bold text-slate-500 uppercase tracking-wide w-[10%]">Status</th>
              <th className="py-3 px-4 text-center font-bold text-slate-500 uppercase tracking-wide w-[8%]">Prioritas</th>
              <th className="py-3 px-4 text-center font-bold text-slate-500 uppercase tracking-wide w-[10%]"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                  Tidak ada request ditemukan
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-4 py-3 text-slate-700 font-medium">{item.request_code}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="font-semibold text-slate-800">{item.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.letter_number}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{item.pic_name || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(item.deadline)}</td>
                  <td className="px-4 py-3 text-slate-600">{item.platform_target}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePriority(item.id);
                      }}
                      className="focus:outline-none inline-flex items-center justify-center"
                    >
                      {item.is_priority ? (
                        <Star 
                          size={16} 
                          fill="#FF6900" 
                          stroke="#FF6900" 
                          strokeWidth={1.2}
                        />
                      ) : (
                        <Star 
                          size={16} 
                          fill="none" 
                          stroke="#FF6900" 
                          strokeWidth={1.2}
                        />
                      )}
                    </button>
                  </td>
                  <td className="text-center px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(item.id)}
                      className="btn-detail-custom text-[11px]"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}