import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const STATUS_CONFIG = [
  {
    key: "total_request",
    label: "Total Request",
    color: "#475569", 
  },
  {
    key: "menunggu",
    label: "Menunggu",
    color: "#FB923C",
  },
  {
    key: "diproses",
    label: "Diproses",
    color: "#2563EB",
  },
  {
    key: "revisi",
    label: "Revisi",
    color: "#EA580C",
  },
  {
    key: "selesai",
    label: "Selesai",
    color: "#16A34A",
  },
  {
    key: "ditolak",
    label: "Ditolak",
    color: "#DC2626",
  },
];

export default function WorkloadBarCharts({
  workload,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-gray-200 ">
      {STATUS_CONFIG.map((status) => (
        <div
          key={status.key}
          className="
            bg-white
            rounded-2xl
            p-5
            shadow-sm
            border
            border-slate-100
            hover:shadow-md
            transition
          "
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: status.color,
              }}
            />

            <h3
              className="font-semibold text-sm"
              style={{
                color: status.color,
              }}
            >
              {status.label}
            </h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={workload}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 20,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  angle={-15}
                  textAnchor="end"
                  height={55}
                  tick={{
                    fontSize: 11,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(0,0,0,0.04)",
                  }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />

                <Bar
                  dataKey={status.key}
                  fill={status.color}
                  radius={[10, 10, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}