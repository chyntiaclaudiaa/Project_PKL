import React from 'react';
import '../../style/MemberDashboard.css'; 

export default function ReportSummaryCards({ summary }) {
  const cards = [
    { title: "Total Request", value: summary.total, type: "total" },
    { title: "Menunggu", value: summary.menunggu, type: "waiting" },
    { title: "Diproses", value: summary.diproses, type: "process" },
    { title: "Selesai", value: summary.selesai, type: "done" },
    { title: "Ditolak", value: summary.ditolak, type: "rejected" },
    { title: "Revisi", value: summary.revisi, type: "revision" },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`summary-card ${card.type} rounded-2xl overflow-hidden`}
            style={{ height: 'auto' }} 
          >
            {/* Bagian Angka */}
            <h2 className="text-3xl font-bold leading-none">
              {card.value || 0}
            </h2>

            <p className="text-sm text-slate-500 mt-1 mb-0">
              {card.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}