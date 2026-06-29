export default function WorkloadTable({ data }) {
  const totals = data.reduce(
    (acc, item) => ({
      menunggu: acc.menunggu + Number(item.menunggu || 0),
      diproses: acc.diproses + Number(item.diproses || 0),
      revisi: acc.revisi + Number(item.revisi || 0),
      selesai: acc.selesai + Number(item.selesai || 0),
      ditolak: acc.ditolak + Number(item.ditolak || 0),
      total_request:
        acc.total_request +
        Number(item.total_request || 0),
    }),
    {
      menunggu: 0,
      diproses: 0,
      revisi: 0,
      selesai: 0,
      ditolak: 0,
      total_request: 0,
    }
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border-2 border-slate-200 ">
      <h2 className="text-lg font-semibold mb-4">
        Workload Anggota
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-2">
              Nama
            </th>

            <th className="py-3 px-2 text-amber-500 font-semibold">
              Menunggu
            </th>

            <th className="py-3 px-2 text-blue-500 font-semibold">
              Diproses
            </th>

            <th className="py-3 px-2 text-orange-600 font-semibold">
              Revisi
            </th>

            <th className="py-3 px-2 text-green-600 font-semibold">
              Selesai
            </th>

            <th className="py-3 px-2 text-red-500 font-semibold">
              Ditolak
            </th>

            <th className="py-3 px-2 font-semibold">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="
                border-b border-gray-100
                hover:bg-slate-50
                transition
              "
            >
              <td className="py-3 px-2 font-medium text-slate-700">
                {item.name}
              </td>

              <td className="text-center text-amber-500 font-medium">
                {item.menunggu}
              </td>

              <td className="text-center text-blue-500 font-medium">
                {item.diproses}
              </td>

              <td className="text-center text-orange-600 font-medium">
                {item.revisi}
              </td>

              <td className="text-center text-green-600 font-medium">
                {item.selesai}
              </td>

              <td className="text-center text-red-500 font-medium">
                {item.ditolak}
              </td>

              <td className="text-center font-bold text-slate-700">
                {item.total_request}
              </td>
            </tr>
          ))}

          <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold">
            <td className="py-3 px-2">
              Total
            </td>

            <td className="text-center text-amber-500">
              {totals.menunggu}
            </td>

            <td className="text-center text-blue-500">
              {totals.diproses}
            </td>

            <td className="text-center text-orange-600">
              {totals.revisi}
            </td>

            <td className="text-center text-green-600">
              {totals.selesai}
            </td>

            <td className="text-center text-red-500">
              {totals.ditolak}
            </td>

            <td className="text-center text-slate-700">
              {totals.total_request}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}