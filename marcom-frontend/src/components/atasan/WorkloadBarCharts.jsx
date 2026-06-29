import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import "../../style/atasan_dashboard.css";

export default function WorkloadBarCharts({ workload }) {
  const formattedData = workload.map(item => ({
    ...item,
    shortName: item.name ? item.name.split(" ")[0] : "User"
  }));

  return (
    <div className="bg-white custom-card-style p-5 h-[380px] flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-800">Workload Anggota</h3>
      </div>

      <div className="h-[260px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={formattedData} 
            margin={{ top: 20, right: 10, left: -30, bottom: 5 }}
            barCategoryGap="25%" 
          >
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="shortName" 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 400 }} /* Ketebalan font disesuaikan ke font-semibold */
            />
            <Bar 
              dataKey="total_request" 
              fill="var(--color-diproses)" 
              radius={[4, 4, 0, 0]} 
              label={{ position: 'top', fill: '#0f459d', fontSize: 11, fontWeight: 'bold' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}