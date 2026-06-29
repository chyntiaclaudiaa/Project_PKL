export default function ReportWorkloadTable({ data }) {
  return (
    <div className="overflow-x-auto custom-card-style bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-slate-600">Anggota</th>
            <th className="px-6 py-3 text-center font-semibold text-slate-600">Progres</th>
            <th className="px-6 py-3 text-center font-semibold text-slate-600">Selesai</th>
            <th className="px-6 py-3 text-center font-semibold text-slate-600">Total</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-600">Tingkat Penyelesaian</th>
            <th className="px-6 py-3 text-center font-semibold text-slate-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.map((user) => {
            const menunggu = Number(user.menunggu) || 0;
            const diproses = Number(user.diproses) || 0;
            const revisi = Number(user.revisi) || 0;
            const selesai = Number(user.selesai) || 0;

            // 1. Progress = Menunggu + Diproses + Revisi
            const progressCount = menunggu + diproses + revisi;

            // 2. Selesai
            const selesaiCount = selesai;

            // 3. Total dari data backend (atau total akumulasi)
            const totalCount = Number(user.total) || (progressCount + selesaiCount);

            // Perhitungan Persentase Tingkat Penyelesaian
            const percentage = totalCount > 0 ? Math.round((selesaiCount / totalCount) * 100) : 0;

            // 4. Aturan Kategori Kinerja/Status Anggota
            let statusLabel = "Tertinggal";
            let statusColor = "text-red-600 bg-red-50 border-red-200";

            if (percentage >= 50 && percentage <= 90) {
              statusLabel = "Normal";
              statusColor = "text-slate-600 bg-slate-50 border-slate-200";
            } else if (percentage > 90) {
              statusLabel = "Unggul";
              statusColor = "text-green-600 bg-green-50 border-green-200";
            }

            // Mendapatkan inisial nama untuk avatar bulat (Contoh: Chairun Nisaq -> CN)
            const initials = user.name
              ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
              : "?";

            return (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                {/* Kolom Nama Anggota */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                      {initials}
                    </div>
                    <span className="font-medium text-slate-700">{user.name}</span>
                  </div>
                </td>

                {/* Kolom Progres */}
                <td className="px-6 py-4 text-center font-medium text-orange-600">
                  {progressCount}
                </td>

                {/* Kolom Selesai */}
                <td className="px-6 py-4 text-center font-medium text-slate-600">
                  {selesaiCount}
                </td>

                {/* Kolom Total */}
                <td className="px-6 py-4 text-center font-medium text-slate-600">
                  {totalCount}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4 min-w-[120px]">
                    <div className="w-24 bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 w-8 text-right">
                      {percentage}%
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColor}`}>
                    {statusLabel}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}