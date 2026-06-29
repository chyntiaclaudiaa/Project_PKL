import "../../atasan_dashboard.css";

export default function WorkloadTable({ data, globalTotal }) {
  // Ambil total seluruh request sistem (keseluruhan tugas) sebagai pembagi global workload bar
  const totalSistem = Number(globalTotal || 0) > 0 ? Number(globalTotal) : 1;

  return (
    <div className="bg-white rounded-xl custom-card-style p-5">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Detail Workload Anggota</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
              <th className="py-3 px-4">Anggota</th>
              <th className="py-3 px-2 text-center">Progres</th>
              <th className="py-3 px-2 text-center">Selesai</th>
              <th className="py-3 px-2 text-center">Ditolak</th>
              <th className="py-3 px-2 text-center">Total</th>
              <th className="py-3 px-4 text-center">Beban Kerja</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data && data.length > 0 ? (
              data.map((item) => {
                const namaInisial = item.name 
                  ? item.name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase() 
                  : "CN";
                
                // Mengambil property murni dari backend controller Anda
                const progresReq = Number(item.progres || 0);
                const selesaiReq = Number(item.selesai || 0);
                const ditolakReq = Number(item.ditolak || 0);
                const totalReq = Number(item.total_request || 0);
                
                // Rumus Beban Kerja: Total tugas dia / Keseluruhan tugas yang ada di sistem
                const loadPercent = Math.min((totalReq / totalSistem) * 100, 100);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors font-medium text-slate-700">
                    {/* Kolom Anggota */}
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-orange-700 text-white flex items-center justify-center font-bold text-[10px]">
                        {namaInisial}
                      </div>
                      <span className="font-bold text-slate-800">{item.name}</span>
                    </td>

                    {/* Kolom Progres */}
                    <td 
                      className="py-3 px-2 text-center font-bold"
                      style={{ color: "var(--color-diproses)" }}
                    >
                      {progresReq}
                    </td>

                    {/* Kolom Selesai */}
                    <td 
                      className="py-3 px-2 text-center font-bold"
                      style={{ color: "var(--color-selesai)" }}
                    >
                      {selesaiReq}
                    </td>

                    {/* Kolom Ditolak */}
                    <td 
                      className="py-3 px-2 text-center font-bold"
                      style={{ color: "var(--color-ditolak)" }}
                    >
                      {ditolakReq}
                    </td>

                    {/* Kolom Total */}
                    <td className="py-3 px-2 text-center text-slate-500 font-bold">
                      {totalReq}
                    </td>

                    {/* Kolom Beban Kerja (Struktur Center Rapi) */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5 w-full max-w-[140px] mx-auto">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${loadPercent}%`,
                              backgroundColor: "var(--color-menunggu)" 
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                          {totalReq}/{globalTotal || 0} ({loadPercent.toFixed(0)}%)
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400 font-bold">
                  Tidak ada data workload anggota.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}