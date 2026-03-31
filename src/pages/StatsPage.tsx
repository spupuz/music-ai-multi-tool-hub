import React, { useState, useEffect } from 'react';
import { ToolProps } from '@/Layout';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Sphere, 
  Graticule 
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import Spinner from '@/components/Spinner';
import { countries as countryList } from '@/utils/countryData';
import { 
  UserStatsIcon, 
  BookOpenIcon, 
  SignalIcon, 
  StatsIcon,
  GlobeAltIcon
} from '@/components/Icons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const WORKER_URL = 'https://gemini-proxy.spupuz.workers.dev';

const StatsPage: React.FC<ToolProps> = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${WORKER_URL}/stats`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center items-center py-24"><Spinner size="w-12 h-12" /></div>;
  if (error) return <div className="text-center py-20 text-red-500 font-bold">Error: {error}</div>;
  if (!stats) return null;

  const mapData: Record<string, number> = {};
  const maxVisitors = Math.max(...Object.values(stats.countries as Record<string, number>), 1);

  Object.entries(stats.countries as Record<string, number>).forEach(([alpha2, count]) => {
    const country = countryList.find(c => c.codeAlpha2 === alpha2);
    if (country) {
      mapData[country.name] = count;
    }
  });

  const colorScale = scaleLinear<string>()
    .domain([0, maxVisitors])
    .range(["#1e293b", "#10b981"]);

  const timelineData = {
    labels: stats.timeline.map((t: any) => t.date),
    datasets: [
      {
        label: 'Unique Visitors',
        data: stats.timeline.map((t: any) => t.uniques),
        borderColor: '#10b981',
        backgroundColor: '#10b98133',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 p-3 sm:p-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Unique Visitors" value={stats.total.uniques} sub="All-time" icon={<UserStatsIcon className="w-6 h-6 text-emerald-500" />} />
        <StatCard title="Total Pageviews" value={stats.total.pageviews} sub="All-time" icon={<BookOpenIcon className="w-6 h-6 text-emerald-500" />} />
        <StatCard title="Engagement Status" value="Online" sub="Real-time" icon={<SignalIcon className="w-6 h-6 text-emerald-500" />} />
        <StatCard title="Countries Reached" value={Object.keys(stats.countries).length} sub="Global Scope" icon={<StatsIcon className="w-6 h-6 text-emerald-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <GlobeAltIcon className="text-emerald-500 w-5 h-5" /> Global Activity: Visits by Country
            </h3>
            {tooltipContent && (
               <div className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg animate-pulse whitespace-nowrap">
                 {tooltipContent}
               </div>
            )}
          </div>
          
          <div className="w-full bg-slate-50/5 dark:bg-gray-900/40 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center justify-center overflow-hidden">
            <ComposableMap width={800} height={400} projectionConfig={{ rotate: [-10, 0, 0], scale: 120 }}>
              <Sphere stroke="#334155" strokeWidth={0.5} id="1" fill="transparent" />
              <Graticule stroke="#334155" strokeWidth={0.3} />
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryName = geo.properties.name;
                    const count = mapData[countryName] || 0;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => setTooltipContent(`${countryName}: ${count} visits`)}
                        onMouseLeave={() => setTooltipContent("")}
                        style={{
                          default: {
                            fill: count > 0 ? colorScale(count) : "#2d3748",
                            outline: "none",
                            stroke: "#1a202c",
                            strokeWidth: 0.3
                          },
                          hover: {
                            fill: "#3b82f6",
                            outline: "none",
                            transition: "all 200ms"
                          },
                          pressed: {
                            fill: "#2563eb",
                            outline: "none"
                          }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>
          
          <div className="mt-4 flex items-center justify-end gap-3 text-xs font-bold text-gray-500 dark:text-gray-400">
             <span>0 visits</span>
             <div className="w-32 h-2 rounded-full bg-gradient-to-r from-gray-700 to-emerald-500"></div>
             <span>{maxVisitors} visits</span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Site Activity Trend</h3>
          <div className="h-[250px]">
            <Line 
              data={timelineData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { beginAtZero: true, grid: { color: 'rgba(156, 163, 175, 0.1)' } },
                    x: { grid: { display: false }, ticks: { color: "#9ca3af" } }
                }
              }} 
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Top Locations</h3>
          <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar">
             {Object.entries(stats.countries as Record<string, number>)
               .sort((a,b) => b[1] - a[1])
               .slice(0, 15)
               .map(([code, count]) => {
                 const country = countryList.find(c => c.codeAlpha2 === code);
                 return (
                   <div key={code} className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                       <span className="text-lg filter grayscale group-hover:grayscale-0 transition-all">
                         {country ? getFlag(country.codeAlpha2) : '🏳️'}
                       </span>
                       <span className="text-sm font-bold text-gray-600 dark:text-gray-300 truncate max-w-[120px]">{country?.name || code}</span>
                     </div>
                     <span className="text-xs font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">{count}</span>
                   </div>
                 )
               })
             }
          </div>
        </div>
      </div>
    </div>
  );
};

const getFlag = (code: string) => {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 0x1F1E6 + (char.charCodeAt(0) - 'A'.charCodeAt(0)));
  return String.fromCodePoint(...codePoints);
};

const StatCard = ({ title, value, sub, icon }: { title: string, value: any, sub: string, icon: React.ReactNode }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
    <div className="flex justify-between items-start mb-4">
      <div className="text-emerald-500">{icon}</div>
      <div className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded tracking-widest">{sub}</div>
    </div>
    <div className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">{value.toLocaleString()}</div>
    <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight">{title}</div>
  </div>
);

export default StatsPage;
