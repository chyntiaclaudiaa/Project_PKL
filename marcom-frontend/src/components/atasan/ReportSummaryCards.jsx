export default function ReportSummaryCards({
  summary,
}) {

  const total =
    Number(summary.total) || 0;

  const cards = [
    {
      title: "Menunggu",
      value: Number(summary.menunggu),
      textColor: "text-orange-600",
      borderColor: "border-orange-200",
    },
    {
      title: "Diproses",
      value: Number(summary.diproses),
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Revisi",
      value: Number(summary.revisi),
      textColor: "text-orange-700",
      borderColor: "border-orange-300",
    },
    {
      title: "Selesai",
      value: Number(summary.selesai),
      textColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: "Ditolak",
      value: Number(summary.ditolak),
      textColor: "text-red-600",
      borderColor: "border-red-200",
    },
    {
      title: "Total Request",
      value: total,
      textColor: "text-slate-700",
      borderColor: "border-slate-300",
    },
  ];

  return (
    <div className="grid grid-cols-6 gap-4">

      {cards.map((item) => {

        const percent =
          item.title === "Total Request"
            ? 100
            : total > 0
            ? (
                (item.value / total) *
                100
              ).toFixed(1)
            : 0;

        return (

          <div
            key={item.title}
            className={`
              border
              rounded-2xl
              shadow-sm
              p-5
               bg-white
               
              ${item.borderColor}
            `}
          >

            <div
              className={`
                text-sm
                font-medium
                ${item.textColor}
              `}
            >
              {item.title}
            </div>

            <div
              className={`
                mt-2
                text-3xl
                font-bold
                ${item.textColor}
              `}
            >
              {item.value}
            </div>

            <div
              className={`
                mt-1
                text-sm
                font-medium
                ${item.textColor}
              `}
            >
              {percent}%
            </div>

          </div>

        );
      })}

    </div>
  );
}