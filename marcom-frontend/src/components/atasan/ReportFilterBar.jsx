import {
  Download,
  CalendarDays,
} from "lucide-react";

export default function ReportFilterBar({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onExport,
}) {

  return (
    <div
      className="
        bg-white
        border
        border-slate-200
        rounded-2xl
        p-5
        flex
        flex-wrap
        items-end
        justify-between
        gap-5
        shadow-sm
      "
    >

      <div className="flex flex-wrap gap-4 ">

        <div>

          <label
            className="
              text-xs
              font-semibold
              text-slate-500
              mb-2
              block
            "
          >
            Tanggal Mulai
          </label>

          <div className="relative">

            <CalendarDays
              size={16}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
              className="
                pl-10
                pr-4
                py-2.5
                border
                border-slate-300
                rounded-xl
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

          </div>

        </div>

        <div>

          <label
            className="
              text-xs
              font-semibold
              text-slate-500
              mb-2
              block
            "
          >
            Sampai Tanggal
          </label>

          <div className="relative">

            <CalendarDays
              size={16}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
              className="
                pl-10
                pr-4
                py-2.5
                border
                border-slate-300
                rounded-xl
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

          </div>

        </div>

      </div>

      <button
        onClick={onExport}
        className="
          bg-orange-600
          hover:bg-orange-700
          text-white
          rounded-xl
          px-5
          py-2.5
          flex
          items-center
          gap-2
          text-sm
          font-medium
          shadow-sm
        "
      >
        <Download size={16} />
        Export PDF
      </button>

    </div>
  );
}