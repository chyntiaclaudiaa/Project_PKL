import "../../style/atasan_dashboard.css";

export default function PriorityRequestTable({ data, onOpenDetail }) {

  const getStatusStyle = (status) => {
    switch (status) {
      case "Menunggu": return "bg-orange-100 text-orange-600";
      case "Diproses": return "bg-blue-100 text-blue-600";
      case "Revisi": return "bg-yellow-100 text-yellow-700";
      case "Selesai": return "bg-green-100 text-green-600";
      case "Ditolak": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white custom-card-style p-5">
      <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-800">
        <span style={{ color: "var(--color-menunggu)" }} className="text-xl">☆</span>
        Daftar Prioritas
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="text-left py-3 px-4 font-bold text-slate-600">Judul</th>
              <th className="py-3 px-4 font-bold text-slate-600 text-center">PIC</th>
              <th className="py-3 px-4 font-bold text-slate-600 text-center">Deadline</th>
              <th className="py-3 px-4 font-bold text-slate-600 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onOpenDetail && onOpenDetail(item.id)}
                  className="border-b border-slate-200 hover:bg-slate-50/80 transition-all cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-medium text-slate-800">{item.title}</td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-600">{item.pic_name || "-"}</td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                    {new Date(item.deadline).toLocaleDateString("id-ID", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-400 font-medium">
                  Tidak ada request prioritas dalam rentang tanggal ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}