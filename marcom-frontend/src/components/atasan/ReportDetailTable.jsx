export default function ReportDetailTable({
  data,
}) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Menunggu":
        return "bg-orange-200 text-orange-600";
      case "Diproses":
        return "bg-blue-200 text-blue-600";
      case "Revisi":
        return "bg-orange-300 text-orange-700";
      case "Selesai":
        return "bg-green-200 text-green-600";
      case "Ditolak":
        return "bg-red-200 text-red-600";
      default:
        return "bg-slate-200 text-slate-600";
    }
  };

  return (
    <div
      className="
        bg-white
        border
        border-slate-200
        rounded-xl
        overflow-hidden
      "
    >

      <table className="w-full text-sm">

        <thead
          className="
            bg-slate-50
            border-b
            border-slate-300
          "
        >
          <tr>
            <th className="px-4 py-3 text-left"> ID Request </th>
            <th className="px-4 py-3 text-left">  Judul Konten </th>
            <th className="px-4 py-3 text-center">  PIC </th>
            <th className="px-4 py-3 text-center">  Deadline  </th>
            <th className="px-4 py-3 text-center">  Status </th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="
                border-t
                border-slate-300
                hover:bg-slate-50
                transition
              "
            >
              <td className="px-4 py-3 text-slate-700">
                {item.request_code}
              </td>
              <td className="px-4 py-3">
                {item.title}
              </td>
              <td className="px-4 py-3 text-center text-slate-700">
                {item.pic_name || "-"}
              </td>
              <td className="px-4 py-3 text-center text-slate-700">
                {new Date(
                  item.deadline
                ).toLocaleDateString("id-ID")}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-semibold
                    ${getStatusStyle(item.status)}
                  `}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}