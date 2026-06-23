import { useNavigate, useLocation } from "react-router-dom";
export default function PriorityRequestTable({ data }) {

  const navigate = useNavigate();

  const getStatusStyle = (status) => {
    switch (status) {
      case "Menunggu":
        return "bg-orange-200 text-orange-500";

      case "Diproses":
        return "bg-blue-200 text-blue-500";

      case "Revisi":
        return "bg-orange-300 text-orange-700";

      case "Selesai":
        return "bg-green-200 text-green-600";

      case "Ditolak":
        return "bg-red-200 text-red-500";

      default:
        return "bg-gray-200 text-gray-500";
    }
  };

  const handleOpenDetail = (id) => {
    const dashboardContainer = document.querySelector(".overflow-auto");
    if (dashboardContainer) {
      sessionStorage.setItem("dashboard-scroll", dashboardContainer.scrollTop);
    }

    navigate(`/atasan/request/${id}`, {
      state: {
        source: "dashboard"
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border-2 border-slate-200">

      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-amber-500 text-xl">☆</span>
        Daftar Prioritas
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">

              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Judul
              </th>

              <th className="py-3 px-4 font-medium text-gray-600">
                PIC
              </th>

              <th className="py-3 px-4 font-medium text-gray-600">
                Deadline
              </th>

              <th className="py-3 px-4 font-medium text-gray-600">
                Status
              </th>

            </tr>
          </thead>

          <tbody>
            {data.map((item) => (

              <tr
                key={item.id}
                onClick={() => handleOpenDetail(item.id)}
                className="
                  border-b border-slate-300
                  hover:bg-orange-50
                  transition
                  cursor-pointer
                "
              >
                <td className="py-4 px-4 font-medium text-gray-800">
                  {item.title}
                </td>

                <td className="py-4 px-4 text-center text-gray-600">
                  {item.pic_name || "-"}
                </td>

                <td className="py-4 px-4 text-center text-gray-600">
                  {new Date(item.deadline)
                    .toLocaleDateString("id-ID")}
                </td>

                <td className="py-4 px-4 text-center">
                  <span
                    className={`
                      inline-flex
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

    </div>
  );
}