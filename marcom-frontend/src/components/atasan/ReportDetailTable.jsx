export default function ReportDetailTable({ data }) {
  // Menggunakan Utility Badge Status langsung dari file atasan_dashboard.css global Anda
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
    /* 1. 'custom-card-style' dipanggil dari atasan_dashboard.css untuk border slate-300 dan no-shadow.
       2. Mengganti 'overflow-hidden' menjadi 'overflow-visible' saat rendering cetak/ekspor agar scrollbar hilang total.
    */
    <div className="bg-white custom-card-style overflow-visible w-full">
      {/* Menghilangkan pembatas 'overflow-x-auto' agar layout tidak membuat window scrollbar buatan 
      */}
      <div className="w-full overflow-visible">
        {/* 'table-fixed' memaksa lebar kolom mengikuti alokasi persen (%) lebar yang kita tentukan 
          agar tabel tidak melebar keluar batas halaman utama.
        */}
        <table className="w-full text-sm border-collapse table-fixed">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50/50">
              <th className="px-4 py-3 text-left w-[5%]">No</th>
              <th className="px-4 py-3 text-left w-[37%]">Judul Konten</th>
              <th className="px-4 py-3 text-left w-[16%]">PIC</th>
              {/* Diubah ke text-center agar pas dengan posisi badge di bawahnya */}
              <th className="px-4 py-3 text-center w-[14%]">Status</th>
              <th className="px-4 py-3 text-left w-[14%]">Deadline</th>
              <th className="px-4 py-3 text-left w-[14%]">Platform</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {data.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition">
                <td className="px-4 py-3 text-slate-500 font-medium">{index + 1}</td>
                
                {/* 'break-words' & 'whitespace-normal': Jika judul terlalu panjang, kata otomatis terpotong 
                  dan turun ke bawah baris baru, menghentikan dorongan horizontal yang memicu scrollbar bawah.
                */}
                <td className="px-4 py-3 font-medium text-slate-900 break-words whitespace-normal">
                  {item.title}
                </td>
                
                <td className="px-4 py-3 break-words whitespace-normal">{item.pic_name || "-"}</td>
                
                <td className="px-4 py-3 text-center">
                  {/* Diperbarui menggunakan class padding/font-weight standar yang presisi */}
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