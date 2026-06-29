export default function ReportDetailTable({ data }) {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Menunggu": return "badge-menunggu";
      case "Diproses": return "badge-diproses";
      case "Revisi": return "badge-revisi";
      case "Selesai": return "badge-selesai";
      case "Ditolak": return "badge-ditolak";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="bg-white custom-card-style overflow-visible w-full">
      <div className="w-full overflow-visible">
        <table className="w-full text-sm border-collapse table-fixed">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50/50">
              <th className="px-4 py-3 text-left w-[5%]">No</th>
              <th className="px-4 py-3 text-left w-[37%]">Judul Konten</th>
              <th className="px-4 py-3 text-left w-[16%]">PIC</th>
              <th className="px-4 py-3 text-center w-[14%]">Status</th>
              <th className="px-4 py-3 text-left w-[14%]">Deadline</th>
              <th className="px-4 py-3 text-left w-[14%]">Platform</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {data.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition">
                <td className="px-4 py-3 text-slate-500 font-medium">{index + 1}</td>
                
                <td className="px-4 py-3 font-medium text-slate-900 break-words whitespace-normal">
                  {item.title}
                </td>
                
                <td className="px-4 py-3 break-words whitespace-normal">{item.pic_name || "-"}</td>
                
                <td className="px-4 py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                
                <td className="px-4 py-3 text-slate-500">
                  {item.deadline ? item.deadline.split("T")[0] : "-"}
                </td>
                
                <td className="px-4 py-3 text-slate-500 font-medium break-words whitespace-normal">
                  {item.platform_target}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}