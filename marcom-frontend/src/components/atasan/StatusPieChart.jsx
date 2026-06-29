import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "../../atasan_dashboard.css";

const CONFIG_WARNA = {
  "Menunggu": "var(--color-menunggu)",
  "Diproses": "var(--color-diproses)",
  "Revisi": "var(--color-revisi)",
  "Selesai": "var(--color-selesai)",
  "Ditolak": "var(--color-ditolak)"
};

export default function StatusPieChart({ data }) {
  const total = data.reduce((sum, item) => sum + Number(item.total), 0);

  return (
    <div className="bg-white custom-card-style p-5 h-[380px] flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-800">Distribusi Status</h3>
      </div>

      <div className="flex items-center justify-between gap-2 h-full mt-2">
        <div className="w-1/2 h-[220px] relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="status"
                innerRadius={65}
                outerRadius={85}
                stroke="none"
                strokeWidth={0}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((item) => (
                  <Cell key={item.status} fill={CONFIG_WARNA[item.status] || "#cbd5e1"} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black" style={{ color: "var(--color-diproses)" }}>
              {total}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Total</span>
          </div>
        </div>

        <div className="w-1/2 space-y-2 px-2">
          {data.map((item) => (
            <div key={item.status} className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CONFIG_WARNA[item.status] }} />
                <span className="text-[#475569] font-medium text-[11px]">{item.status}: {item.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}