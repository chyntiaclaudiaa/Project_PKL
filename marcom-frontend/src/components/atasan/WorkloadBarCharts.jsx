import { ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import "../../style/atasan_dashboard.css";

export default function WorkloadBarCharts({ workload }) {
  const formattedData = workload.map(item => ({
    ...item,
    shortName: item.name ? item.name.split(" ")[0] : "User"
  }));

  const isScrollable = formattedData.length > 6;
  const dynamicWidth = isScrollable ? `${formattedData.length * 75}px` : "100%";

  return (
    <div className="bg-white custom-card-style p-5 h-[380px] flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800">Workload Anggota</h3>
      </div>

      <div className="h-[270px] mt-4 overflow-x-auto overflow-y-hidden pb-2 scrollbar-tipis">
        
        <div style={{ width: dynamicWidth, height: "100%" }} className="transition-all duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={formattedData} 
              margin={{ top: 25, right: 15, left: 15, bottom: 5 }}
              barCategoryGap="25%" 
            >
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="shortName" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
              />
              <Bar 
                dataKey="total_request" 
                fill="var(--color-diproses)" 
                radius={[4, 4, 0, 0]} 
                label={{ 
                  position: 'top', 
                  fill: '#0f459d', 
                  fontSize: 11, 
                  fontWeight: 'bold',
                  offset: 8 
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}