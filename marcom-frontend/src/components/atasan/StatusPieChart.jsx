import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STATUS_CONFIG = {
  Menunggu: {
    color: "#EA580C",
    bg: "#FED7AA",
  },
  Diproses: {
    color: "#2563EB",
    bg: "#BFDBFE",
  },
  Revisi: {
    color: "#C2410C",
    bg: "#FDBA74",
  },
  Selesai: {
    color: "#16A34A",
    bg: "#BBF7D0",
  },
  Ditolak: {
    color: "#DC2626",
    bg: "#FECACA",
  },
};

export default function StatusPieChart({
  data,
}) {
  const total = data.reduce(
    (sum, item) => sum + Number(item.total),
    0
  );

  return (
    <div
      className="
        bg-white
        rounded-2xl
        border
        border-slate-200
        p-6
        shadow-sm
      "
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800">
          Distribusi Status Request
        </h2>

        <p className="text-sm text-slate-500">
          Komposisi seluruh request berdasarkan status
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-10">

        {/* Chart */}

        <div className="w-full lg:w-[380px] h-[320px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>

              <Pie
                data={data}
                dataKey="total"
                nameKey="status"
                innerRadius={100}
                outerRadius={160}
                paddingAngle={0}
                stroke="none"
                isAnimationActive={true}
              >
                {data.map((item) => (
                  <Cell
                    key={item.status}
                    fill={
                      STATUS_CONFIG[item.status]
                        ?.color || "#CBD5E1"
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [
                  `${value} Request`,
                  "Jumlah",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border:
                    "1px solid #E2E8F0",
                  boxShadow:
                    "0 8px 24px rgba(0,0,0,.08)",
                }}
              />

              {/* Total Tengah */}

              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                className="fill-slate-400"
                fontSize="13"
              >
                Total
              </text>

              <text
                x="50%"
                y="56%"
                textAnchor="middle"
                className="fill-slate-800"
                fontSize="28"
                fontWeight="700"
              >
                {total}
              </text>

            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}

        <div className="space-y-3 w-full max-w-[260px]">

          {data.map((item) => {
            const percent =
              total > 0
                ? (
                    (item.total / total) *
                    100
                  ).toFixed(1)
                : 0;

            return (
              <div
                key={item.status}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-3
                  hover:shadow-sm
                  transition
                "
              >
                <div className="flex items-center gap-3">

                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        STATUS_CONFIG[
                          item.status
                        ]?.color,
                    }}
                  />

                  <span className="font-medium text-sm text-slate-700">
                    {item.status}
                  </span>

                </div>

                <div className="text-right">

                  <div className="font-semibold text-sm text-slate-800">
                    {item.total}
                  </div>

                  <div className="text-xs text-slate-500">
                    {percent}%
                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}