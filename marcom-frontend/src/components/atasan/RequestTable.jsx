import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";



export default function RequestTable({
  data,
  onTogglePriority,
}) {

  const navigate = useNavigate();

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
        return "bg-gray-200 text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      <table className="w-full text-sm">

        <thead className="bg-gray-50 border-b border-gray-300">
          <tr>

            <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              ID
            </th>

            <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Judul Konten
            </th>

            <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              PIC
            </th>

            <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Deadline
            </th>

            <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Platform
            </th>

            <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Status
            </th>

            <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Prioritas
            </th>

          </tr>
        </thead>

        <tbody>

          {data.map((item) => (

            <tr
              key={item.id}
              onClick={() =>
                navigate(
                  `/atasan/request/${item.id}`,
                  {
                    state: {
                      source: "request",
                    },
                  }
                )
              }
              className="
                cursor-pointer
                border-t
                border-gray-300
                hover:bg-gray-100
                transition-colors
                duration-150
              "
            >

              <td className="px-4 py-4 text-gray-700">
                {item.request_code}
              </td>

              <td className="px-4 py-4 text-gray-700">

                <div className="font-medium">
                  {item.title}
                </div>

                <div className="text-xs text-gray-500">
                  {item.letter_number}
                </div>

              </td>

              <td className="px-4 py-4 text-gray-700">
                {item.pic_name || "-"}
              </td>

              <td className="px-4 py-4 text-gray-700">
                {new Date(
                  item.deadline
                ).toLocaleDateString("id-ID")}
              </td>

              <td className="px-4 py-4 text-gray-700">
                {item.platform_target}
              </td>

              <td className="px-4 py-4 text-center text-gray-700">

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

              <td className="text-center">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePriority(item.id);
                  }}
                >

                  <Star
                    size={20}
                    fill={
                      item.is_priority
                        ? "#F59E0B"
                        : "none"
                    }
                    className={
                      item.is_priority
                        ? "text-amber-500"
                        : "text-slate-400"
                    }
                  />

                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}