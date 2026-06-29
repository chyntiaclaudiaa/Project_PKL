export default function ReportSummaryCards({ summary }) {
  const cards = [
    { title: "Total Request", value: summary.total, color: "#034EA2" },
    { title: "Menunggu", value: summary.menunggu, color: "var(--color-menunggu)" },
    { title: "Diproses", value: summary.diproses, color: "var(--color-diproses)" },
    { title: "Selesai", value: summary.selesai, color: "var(--color-selesai)" },
    { title: "Ditolak", value: summary.ditolak, color: "var(--color-ditolak)" },
    { title: "Revisi", value: summary.revisi, color: "var(--color-revisi)" },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: card.color }}
          >
            <div className="ml-[4px] bg-slate-50 rounded-2xl px-4 py-3 h-full">
              <div
                className="text-3xl font-bold leading-none"
                style={{ color: card.color }}
              >
                {card.value || 0}
              </div>

              <div className="text-sm text-slate-500 mt-1">
                {card.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}